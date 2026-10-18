import { prisma } from '../../../../lib/prisma';
import { requireRole } from '../../../../lib/auth';

/**
 * PATCH /api/hearings/[id]
 * Memperbarui catatan sidang / observasi paralegal
 * RBAC: PARALEGAL, CONSULTANT, ADMIN
 */
export async function PATCH(request, { params }) {
  const { user, error } = await requireRole(['PARALEGAL', 'CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { notes, title, stage, location } = body;

  const existingHearing = await prisma.caseHearing.findUnique({
    where: { id },
  });

  if (!existingHearing) {
    return Response.json({ error: 'Jadwal sidang tidak ditemukan.' }, { status: 404 });
  }

  const updated = await prisma.caseHearing.update({
    where: { id },
    data: {
      ...(notes !== undefined ? { notes } : {}),
      ...(title ? { title } : {}),
      ...(stage ? { stage } : {}),
      ...(location ? { location } : {}),
    },
  });

  return Response.json({ hearing: updated });
}
