import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';

/**
 * POST /api/cases/:id/dossier
 * Pengarsipan Berkas Perkara ke dalam Buku Induk Dossier (SOP-06)
 * RBAC: SEKRETARIS atau ADMIN (Kepala LKBH)
 */
export async function POST(request, { params }) {
  const { user, error } = await requireRole(['SEKRETARIS', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;
  const body = await request.json().catch(() => ({}));

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: { client: true },
  });

  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  const currentYear = new Date().getFullYear();
  const dossierSeq = Math.floor(10 + Math.random() * 90);
  const dossierNumber =
    body.dossierNumber?.trim() ||
    `DOSSIER/LKBH-STHM/${currentYear}/${dossierSeq}`;

  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: {
      dossierNumber,
      isArchived: true,
      archivedAt: new Date(),
      status: 'SELESAI',
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { include: { user: { select: { name: true } } } },
      documents: true,
      hearings: true,
    },
  });

  // Notifikasi pengarsipan
  await prisma.notification.create({
    data: {
      userId: caseRecord.clientId,
      title: 'Berkas Perkara Diarsipkan (Dossier Resmi)',
      body: `Seluruh berkas penanganan perkara ${caseRecord.code} telah resmi diarsipkan ke dalam Buku Induk Dossier LKBH STHM (${dossierNumber}).`,
    },
  });

  return Response.json({ case: updatedCase, dossierNumber });
}
