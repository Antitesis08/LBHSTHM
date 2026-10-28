import { prisma } from '../../../lib/prisma';
import { createCaseSchema, wizardCaseSchema, readJsonBody } from '../../../lib/validators';
import { requireRole } from '../../../lib/auth';

export async function GET() {
  const auth = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN']);
  if (auth.error) return auth.error;
  const where = auth.user.role === 'CUSTOMER' ? { clientId: auth.user.id } : auth.user.role === 'CONSULTANT' ? { consultant: { userId: auth.user.id } } : {};
  const cases = await prisma.case.findMany({
    where,
    include: {
      client: { select: { name: true } },
      consultant: { include: { user: { select: { name: true } } } },
      documents: { select: { id: true, fileName: true, fileType: true, source: true, isGenerated: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
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
  const ts = Date.now().toString().slice(-7);
  return `LBH-STHM/${year}/${ts}`;
}

export async function POST(request) {
  const auth = await requireRole(['CUSTOMER']);
  if (auth.error) return auth.error;

  const payload = await readJsonBody(request);

  // Validate request
  const parsed = createCaseSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message || 'Data pengajuan tidak valid.' }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate unique case code
      const code = await generateCaseCode(tx);

      // 2. Create Case (without initial consultant & serviceType decided later in LBH meeting)
      const isProBono = Boolean(data.isProBono);
      const caseRecord = await tx.case.create({
        data: {
          code,
          title: data.title,
          description: data.description,
          serviceType: data.serviceType || (isProBono ? 'PRO_BONO' : null),
          isProBono,
          clientId: auth.user.id,
          consultantId: null, // Konsultan akan ditentukan oleh Admin setelah rapat & Legal Opinion
          status: 'DIAJUKAN',
        },
      });

      // 3. Notify all admins
      const admins = await tx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: 'Pengajuan bantuan hukum baru',
            body: `Pengajuan baru ${code} menunggu rapat internal & verifikasi kelayakan.`,
          })),
        });
      }

      return { case: caseRecord };
    });

    return Response.json({ case: result.case }, { status: 201 });
  } catch (err) {
    console.error('POST /api/cases error:', err);
    return Response.json({ error: 'Terjadi kesalahan pada server saat membuat pengajuan.' }, { status: 500 });
  }
}
