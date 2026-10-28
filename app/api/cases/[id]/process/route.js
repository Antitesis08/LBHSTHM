import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';

/**
 * PATCH /api/cases/:id/process
 * Digunakan oleh konsultan untuk memperbarui proses penanganan hukum:
 * - Menyimpan catatan rekomendasi & arahan konsultasi
 * - Memperbarui tahapan beracara (litigationStage)
 * - Menyimpan link Surat Kuasa Khusus
 * - Memperbarui status ke 'PROSES' atau 'SELESAI'
 */
export async function PATCH(request, { params }) {
  const { user, error } = await requireRole(['CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;
  const body = await request.json().catch(() => ({}));

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: { consultant: true, client: true },
  });

  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  if (user.role === 'CONSULTANT' && caseRecord.consultant?.userId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const updateData = {};

  if (body.consultationNotes !== undefined) {
    updateData.consultationNotes = body.consultationNotes;
    // Otomatis ubah status ke PROSES jika sebelumnya DITUGASKAN
    if (caseRecord.status === 'DITUGASKAN') {
      updateData.status = 'PROSES';
    }
  }

  if (body.litigationStage !== undefined) {
    updateData.litigationStage = body.litigationStage;
  }

  if (body.powerOfAttorneyUrl !== undefined) {
    updateData.powerOfAttorneyUrl = body.powerOfAttorneyUrl;
    if (caseRecord.status === 'DITUGASKAN') {
      updateData.status = 'PROSES';
    }
  }

  if (body.status !== undefined) {
    if (body.status === 'SELESAI' && user.role === 'CONSULTANT') {
      return Response.json({
        error: 'Penyelesaian perkara oleh konsultan wajib melalui pengunggahan dokumen hasil dan verifikasi Sekretaris LKBH.'
      }, { status: 400 });
    }
    if (!['DITUGASKAN', 'PROSES', 'MENUNGGU_VERIFIKASI_SEKRETARIS', 'SELESAI'].includes(body.status)) {
      return Response.json({ error: 'Status tidak valid.' }, { status: 400 });
    }
    updateData.status = body.status;
  }

  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: updateData,
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: {
        include: { user: { select: { name: true, email: true } } },
      },
      hearings: { orderBy: { date: 'asc' } },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  });

  // Notifikasi ke klien jika ada arahan konsultasi baru atau kasus selesai
  if (body.consultationNotes && caseRecord.consultationNotes !== body.consultationNotes) {
    await prisma.notification.create({
      data: {
        userId: caseRecord.clientId,
        title: 'Arahan Konsultasi Hukum Baru',
        body: `Konsultan ${caseRecord.consultant?.user?.name || 'LBH'} telah memberikan catatan rekomendasi hukum baru untuk perkara Anda.`,
      },
    });
  }

  if (body.status === 'SELESAI') {
    await prisma.notification.create({
      data: {
        userId: caseRecord.clientId,
        title: 'Penanganan Perkara Selesai',
        body: `Penanganan perkara ${caseRecord.code} telah diselesaikan secara tuntas oleh tim hukum LKBH STHM.`,
      },
    });
  }

  return Response.json({ case: updatedCase });
}
