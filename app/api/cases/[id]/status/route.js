import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';

const VALID_TRANSITIONS = {
  DIAJUKAN: ['DITUGASKAN', 'DITOLAK'],
};

export async function PATCH(request, { params }) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = body.status;

  if (!status || !['DITUGASKAN', 'DITOLAK'].includes(status)) {
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

  if (!VALID_TRANSITIONS[caseRecord.status]?.includes(status)) {
    return Response.json({ error: 'Transisi status tidak valid.' }, { status: 409 });
  }

  if (status === 'DITOLAK') {
    const reason = (body.reason || '').toString().trim();
    if (!reason) {
      return Response.json({ error: 'Alasan penolakan wajib diisi.' }, { status: 400 });
    }
  }

  const updatedCase = await prisma.$transaction(async (tx) => {
    const updated = await tx.case.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'DITOLAK' ? (body.reason || '').toString().trim() : null,
      },
    });

    // When case is rejected, delete associated schedules to free up slots
    // This is required because Schedule has @@unique([consultantId, scheduledAt])
    if (status === 'DITOLAK') {
      await tx.schedule.deleteMany({ where: { caseId: id } });
    }

    return updated;
  });

  if (status === 'DITUGASKAN' && caseRecord.consultantId) {
    const consultantName = caseRecord.consultant?.user?.name || 'konsultan';
    await prisma.notification.create({
      data: {
        userId: caseRecord.clientId,
        title: 'Kasus Diverifikasi',
        body: `Kasus Anda [${updatedCase.code}] telah diverifikasi dan ditugaskan ke ${consultantName}.`,
      },
    });
  }

  if (status === 'DITOLAK') {
    await prisma.notification.create({
      data: {
        userId: caseRecord.clientId,
        title: 'Kasus ditolak',
        body: `Kasus ${updatedCase.code} telah ditolak. Alasan: ${(body.reason || '').toString().trim()}`,
      },
    });
  }

  return Response.json({ case: updatedCase });
}
