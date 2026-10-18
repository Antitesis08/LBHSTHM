import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';

const VALID_TRANSITIONS = {
  DIAJUKAN: ['DIVERIFIKASI', 'DITUGASKAN', 'DITOLAK'],
  DIVERIFIKASI: ['DITUGASKAN', 'DITOLAK'],
  DITUGASKAN: ['PROSES', 'DITOLAK'],
  PROSES: ['SELESAI', 'MENUNGGU_DOKUMEN', 'DITOLAK'],
  MENUNGGU_DOKUMEN: ['PROSES', 'SELESAI', 'DITOLAK'],
};

const ALLOWED_STATUSES = ['DIVERIFIKASI', 'DITUGASKAN', 'PROSES', 'MENUNGGU_DOKUMEN', 'SELESAI', 'DITOLAK'];

export async function PATCH(request, { params }) {
  const { user, error } = await requireRole(['ADMIN', 'CONSULTANT']);
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = body.status;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return Response.json({ error: 'Status tidak valid.' }, { status: 400 });
  }

  const caseRecord = await prisma.case.findUnique({ 
    where: { id },
    include: {
      consultant: {
        include: { user: true }
      }
    }
  });
  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  // RBAC: Consultant only can update to PROSES, MENUNGGU_DOKUMEN, SELESAI for assigned cases
  if (user.role === 'CONSULTANT') {
    if (caseRecord.consultant?.userId !== user.id) {
      return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
    }
    if (!['PROSES', 'MENUNGGU_DOKUMEN', 'SELESAI'].includes(status)) {
      return Response.json({ error: 'Konsultan hanya dapat memperbarui status pelaksanaan kasus.' }, { status: 403 });
    }
  }

  if (!VALID_TRANSITIONS[caseRecord.status]?.includes(status)) {
    return Response.json({ error: `Transisi dari ${caseRecord.status} ke ${status} tidak diizinkan.` }, { status: 409 });
  }

  if (status === 'DITOLAK') {
    const reason = (body.reason || '').toString().trim();
    if (!reason) {
      return Response.json({ error: 'Alasan penolakan wajib diisi.' }, { status: 400 });
    }
  }

  const updatedCase = await prisma.$transaction(async (tx) => {
    const updateData = {
      status,
      rejectionReason: status === 'DITOLAK' ? (body.reason || '').toString().trim() : null,
    };
    if (body.serviceType) {
      updateData.serviceType = body.serviceType;
    }

    const updated = await tx.case.update({
      where: { id },
      data: updateData,
    });

    if (status === 'DITOLAK') {
      await tx.schedule.deleteMany({ where: { caseId: id } });
    }

    return updated;
  });

  if (status === 'DIVERIFIKASI') {
    await prisma.notification.create({
      data: {
        userId: caseRecord.clientId,
        title: 'Permohonan Disetujui (ACC)',
        body: `Permohonan Anda [${updatedCase.code}] telah disetujui (ACC) hasil rapat LBH STHM. Dokumen Legal Opinion telah diterbitkan.`,
      },
    });
  } else if (status === 'DITUGASKAN' && caseRecord.consultantId) {
    const consultantName = caseRecord.consultant?.user?.name || 'konsultan';
    await prisma.notification.create({
      data: {
        userId: caseRecord.clientId,
        title: 'Konsultan Ditugaskan',
        body: `Kasus Anda [${updatedCase.code}] telah ditugaskan ke ${consultantName}.`,
      },
    });
  } else if (status === 'DITOLAK') {
    await prisma.notification.create({
      data: {
        userId: caseRecord.clientId,
        title: 'Permohonan Ditolak',
        body: `Permohonan [${updatedCase.code}] belum dapat disetujui. Catatan rapat: ${(body.reason || '').toString().trim()}`,
      },
    });
  }

  return Response.json({ case: updatedCase });
}
