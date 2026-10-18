import { prisma } from '../../../lib/prisma';
import { wizardCaseSchema, readJsonBody } from '../../../lib/validators';
import { requireRole } from '../../../lib/auth';

export async function GET() {
  const auth = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN']);
  if (auth.error) return auth.error;
  const where = auth.user.role === 'CUSTOMER' ? { clientId: auth.user.id } : auth.user.role === 'CONSULTANT' ? { consultant: { userId: auth.user.id } } : {};
  const cases = await prisma.case.findMany({ where, include: { client: { select: { name: true } }, consultant: { include: { user: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' } });
  return Response.json({ cases });
}

/**
 * Generate unique case code with retry on collision.
 * Format: LBH-STHM/YYYY/XXXXX
 */
async function generateCaseCode(tx, maxRetries = 5) {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const random = Math.floor(10000 + Math.random() * 90000).toString();
    const code = `LBH-STHM/${year}/${random}`;
    const existing = await tx.case.findUnique({ where: { code } });
    if (!existing) return code;
  }
  // Fallback: use timestamp-based code
  const ts = Date.now().toString().slice(-7);
  return `LBH-STHM/${year}/${ts}`;
}

export async function POST(request) {
  const auth = await requireRole(['CUSTOMER']);
  if (auth.error) return auth.error;

  const payload = await readJsonBody(request);

  // Determine which schema to use based on whether scheduledAt is provided (wizard flow)
  const isWizardFlow = payload.scheduledAt !== undefined;

  if (isWizardFlow) {
    // === WIZARD FLOW: Case + Schedule in one transaction ===
    const parsed = wizardCaseSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;
    const scheduledAt = new Date(data.scheduledAt);

    // Basic date validation
    if (isNaN(scheduledAt.getTime())) {
      return Response.json({ error: 'Format jadwal tidak valid.' }, { status: 400 });
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (scheduledAt < now) {
      return Response.json({ error: 'Jadwal sudah lewat.' }, { status: 400 });
    }
    if (scheduledAt > new Date(maxDate.getTime() + 24 * 60 * 60 * 1000)) {
      return Response.json({ error: 'Jadwal tidak boleh lebih dari 30 hari ke depan.' }, { status: 400 });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Validate consultant exists and is available
        const consultant = await tx.consultantProfile.findUnique({
          where: { id: data.consultantId },
          select: { id: true, isAvailable: true },
        });
        if (!consultant) {
          throw new Error('VALIDATION:Konsultan yang dipilih tidak valid.');
        }
        if (!consultant.isAvailable) {
          throw new Error('VALIDATION:Konsultan sedang tidak tersedia.');
        }

        // 2. Generate unique case code
        const code = await generateCaseCode(tx);

        // 3. Create Case
        const isProBono = data.serviceType === 'PRO_BONO';
        const caseRecord = await tx.case.create({
          data: {
            code,
            title: data.title,
            description: data.description,
            serviceType: data.serviceType,
            isProBono,
            proBonoProof: isProBono ? (data.proBonoProof || null) : null,
            clientId: auth.user.id,
            consultantId: consultant.id,
            status: 'DIAJUKAN',
          },
        });

        // 4. Create Schedule (unique constraint [consultantId, scheduledAt] prevents double booking)
        const schedule = await tx.schedule.create({
          data: {
            caseId: caseRecord.id,
            consultantId: consultant.id,
            scheduledAt,
            mode: data.mode,
            meetingLink: null,
            location: data.mode === 'offline' ? (data.location || null) : null,
          },
        });

        // 5. Notify all admins
        const admins = await tx.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });
        if (admins.length > 0) {
          await tx.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              title: 'Pengajuan baru',
              body: `Pengajuan baru ${code} menunggu verifikasi.`,
            })),
          });
        }

        return { case: caseRecord, schedule };
      });

      return Response.json({
        case: result.case,
        schedule: result.schedule,
      }, { status: 201 });

    } catch (err) {
      // Handle Prisma unique constraint violation (P2002) — double booking
      if (err.code === 'P2002') {
        return Response.json({
          error: 'Slot ini baru saja terisi oleh pengajuan lain, silakan pilih slot lain.',
        }, { status: 409 });
      }
      // Handle our custom validation errors
      if (err.message?.startsWith('VALIDATION:')) {
        return Response.json({ error: err.message.replace('VALIDATION:', '') }, { status: 400 });
      }
      console.error('POST /api/cases wizard error:', err);
      return Response.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
    }
  }
}
