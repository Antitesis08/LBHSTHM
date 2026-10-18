import { prisma } from '../../../../lib/prisma';
import { requireRole } from '../../../../lib/auth';

/**
 * GET /api/paralegal/cases
 * Mengambil daftar kasus yang dibantu oleh paralegal
 */
export async function GET(request) {
  const { user, error } = await requireRole(['PARALEGAL', 'CONSULTANT', 'ADMIN']);
  if (error) return error;

  const whereClause =
    user.role === 'PARALEGAL'
      ? { assignedParalegalId: user.id }
      : {};

  const cases = await prisma.case.findMany({
    where: whereClause,
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { include: { user: { select: { name: true, email: true } } } },
      paralegal: { select: { id: true, name: true, email: true } },
      hearings: { orderBy: { date: 'asc' } },
      documents: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ cases });
}

/**
 * POST /api/paralegal/cases
 * Menugaskan paralegal / mahasiswa praktikan ke perkara
 * RBAC: ADMIN atau CONSULTANT
 */
export async function POST(request) {
  const { user, error } = await requireRole(['ADMIN', 'CONSULTANT']);
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { caseId, paralegalId } = body;

  if (!caseId || !paralegalId) {
    return Response.json({ error: 'ID Kasus dan ID Paralegal wajib disediakan.' }, { status: 400 });
  }

  const paralegalUser = await prisma.user.findFirst({
    where: { id: paralegalId, role: 'PARALEGAL' },
  });

  if (!paralegalUser) {
    return Response.json({ error: 'Paralegal tidak valid.' }, { status: 404 });
  }

  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: { assignedParalegalId: paralegalId },
    include: {
      client: { select: { name: true } },
      paralegal: { select: { name: true, email: true } },
    },
  });

  // Notifikasi ke mahasiswa praktikan
  await prisma.notification.create({
    data: {
      userId: paralegalId,
      title: 'Penugasan Asistensi Perkara',
      body: `Anda ditugaskan sebagai Asisten Paralegal untuk perkara ${updatedCase.code} (${updatedCase.title}).`,
    },
  });

  return Response.json({ case: updatedCase });
}
