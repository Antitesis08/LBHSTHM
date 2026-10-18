import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';

export async function PATCH(request, { params }) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const consultantId = (body.consultantId || '').toString().trim();

  if (!consultantId) {
    return Response.json({ error: 'Konsultan wajib dipilih.' }, { status: 400 });
  }

  const caseRecord = await prisma.case.findUnique({ where: { id } });
  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  if (['SELESAI', 'DITOLAK'].includes(caseRecord.status)) {
    return Response.json({ error: 'Kasus sudah selesai atau ditolak, tidak bisa diganti konsultannya.' }, { status: 409 });
  }

  const consultantProfile = await prisma.consultantProfile.findUnique({ where: { id: consultantId } });
  if (!consultantProfile) {
    return Response.json({ error: 'Konsultan tidak valid.' }, { status: 404 });
  }

  const updatedCase = await prisma.case.update({
    where: { id },
    data: {
      consultantId,
      status: 'DITUGASKAN',
      rejectionReason: null,
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { select: { id: true, user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (body.scheduledAt) {
    await prisma.schedule.create({
      data: {
        caseId: id,
        scheduledAt: new Date(body.scheduledAt),
        mode: body.mode || 'online',
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: updatedCase.clientId,
        title: 'Kasus ditugaskan',
        body: `Kasus ${updatedCase.code} telah ditugaskan ke ${updatedCase.consultant?.user?.name || 'konsultan'}.`,
      },
      {
        userId: consultantProfile.userId,
        title: 'Kasus baru',
        body: `Anda ditugaskan pada kasus ${updatedCase.code}.`,
      },
    ],
  });

  return Response.json({ case: updatedCase });
}
