import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';

/**
 * GET /api/cases/:id/hearings
 * RBAC: CLIENT (pemilik), CONSULTANT (yang ditugaskan), ADMIN
 */
export async function GET(request, { params }) {
  const { user, error } = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      consultant: true,
      hearings: { orderBy: { date: 'asc' } },
    },
  });

  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  // Authorization check
  if (user.role === 'CUSTOMER' && caseRecord.clientId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }
  if (user.role === 'CONSULTANT' && caseRecord.consultant?.userId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  return Response.json({ hearings: caseRecord.hearings });
}

/**
 * POST /api/cases/:id/hearings
 * Menambah agenda sidang / pendampingan
 * RBAC: CONSULTANT (yang ditugaskan) atau ADMIN
 */
export async function POST(request, { params }) {
  const { user, error } = await requireRole(['CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;
  const body = await request.json().catch(() => ({}));

  const { title, date, stage, location, notes, documentUrl, documentName } = body;

  if (!title || !date) {
    return Response.json({ error: 'Judul agenda dan tanggal wajib diisi.' }, { status: 400 });
  }

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

  const hearing = await prisma.caseHearing.create({
    data: {
      caseId,
      title: title.trim(),
      date: new Date(date),
      stage: stage?.trim() || null,
      location: location?.trim() || null,
      notes: notes?.trim() || null,
      documentUrl: documentUrl || null,
      documentName: documentName || null,
    },
  });

  // Update case status to PROSES if still DITUGASKAN, and update litigationStage
  const updateData = {};
  if (stage) updateData.litigationStage = stage.trim();
  if (caseRecord.status === 'DITUGASKAN') updateData.status = 'PROSES';

  if (Object.keys(updateData).length > 0) {
    await prisma.case.update({
      where: { id: caseId },
      data: updateData,
    });
  }

  // Kirim notifikasi ke klien
  await prisma.notification.create({
    data: {
      userId: caseRecord.clientId,
      title: 'Agenda Pendampingan Baru',
      body: `Agenda baru ditambahkan: "${title}" pada ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(date))}.`,
    },
  });

  return Response.json({ hearing }, { status: 201 });
}
