import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';

/**
 * POST / PATCH: /api/cases/:id/bagk
 * Pengelolaan Berita Acara Gelar Kasus (BAGK) sesuai SOP-02
 * RBAC: SEKRETARIS atau ADMIN (Kepala LKBH)
 */
export async function POST(request, { params }) {
  const { user, error } = await requireRole(['SEKRETARIS', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;
  const body = await request.json().catch(() => ({}));

  const { bagkNumber, bagkNotes, conflictOfInterestCheck, status, serviceType } = body;

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: { client: true },
  });

  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  const currentYear = new Date().getFullYear();
  const generatedBagkNumber =
    bagkNumber?.trim() ||
    `BAGK/${Math.floor(100 + Math.random() * 900)}/LKBH-STHM/${currentYear}`;

  const updateData = {
    bagkNumber: generatedBagkNumber,
    bagkNotes: bagkNotes?.trim() || caseRecord.bagkNotes,
    conflictOfInterestCheck: conflictOfInterestCheck ?? caseRecord.conflictOfInterestCheck,
  };

  if (status) {
    updateData.status = status;
  }
  if (serviceType) {
    updateData.serviceType = serviceType;
  }

  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: updateData,
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  // Notifikasi ke klien jika status diperbarui
  if (status && status !== caseRecord.status) {
    await prisma.notification.create({
      data: {
        userId: caseRecord.clientId,
        title: 'Hasil Rapat Gelar Kasus LKBH',
        body: `Rapat Gelar Kasus untuk permohonan ${caseRecord.code} telah menetapkan status: ${status}.`,
      },
    });
  }

  return Response.json({ case: updatedCase, bagkNumber: generatedBagkNumber });
}
