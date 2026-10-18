import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';

function normalizeRole(role) {
  return role === 'CONSULTANT' ? 'CONSULTANT' : role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
}

function getCaseAccessError(user, caseRecord) {
  if (user.role === 'CUSTOMER' && caseRecord.clientId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }
  if (user.role === 'CONSULTANT' && caseRecord.consultant?.userId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }
  return null;
}

export async function GET(request, { params }) {
  const { user, error } = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;
  const after = request.nextUrl.searchParams.get('after');

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: { consultant: { select: { userId: true } } },
  });

  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  const accessError = getCaseAccessError(user, caseRecord);
  if (accessError) return accessError;

  const where = { caseId };
  if (after) {
    where.createdAt = { gt: new Date(after) };
  }

  const messages = await prisma.message.findMany({
    where,
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return Response.json({ messages });
}

export async function POST(request, { params }) {
  const { user, error } = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;
  const body = await request.json().catch(() => ({}));
  const content = (body.content || '').toString().trim();

  if (!content) {
    return Response.json({ error: 'Isi pesan tidak boleh kosong.' }, { status: 400 });
  }

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: { consultant: { select: { userId: true } } },
  });

  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  const accessError = getCaseAccessError(user, caseRecord);
  if (accessError) return accessError;

  if (caseRecord.status === 'SELESAI' || caseRecord.status === 'DITOLAK') {
    return Response.json({ error: 'Pesan tidak dapat dikirim karena kasus sudah selesai atau ditolak.' }, { status: 409 });
  }

  const message = await prisma.message.create({
    data: {
      caseId,
      senderId: user.id,
      content,
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  const recipientUserId = normalizeRole(user.role) === 'CUSTOMER'
    ? caseRecord.consultant?.userId || null
    : caseRecord.clientId;

  if (recipientUserId && recipientUserId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        title: 'Pesan baru',
        body: `${user.name} mengirim pesan di kasus ${caseRecord.code}`,
      },
    });
  }

  return Response.json({ message }, { status: 201 });
}
