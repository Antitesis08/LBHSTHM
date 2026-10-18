import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';
import { documentUploadSchema } from '../../../../../lib/validators';
import { saveFileBuffer } from '../../../../../lib/storage';

/**
 * POST /api/cases/:id/documents — Upload dokumen ke case
 * RBAC:
 *   CUSTOMER  → hanya case miliknya, source otomatis CLIENT
 *   CONSULTANT → hanya case ditugaskan, source CONSULTANT_GENERATED | EXTERNAL_OFFICIAL
 *   ADMIN → bebas semua
 */
export async function POST(request, { params }) {
  const { user, error } = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;

  // Ambil case + relasi konsultan
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: { consultant: { select: { userId: true } } },
  });
  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  // RBAC: cek kepemilikan
  if (user.role === 'CUSTOMER' && caseRecord.clientId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }
  if (user.role === 'CONSULTANT' && caseRecord.consultant?.userId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ error: 'File wajib diunggah.' }, { status: 400 });
  }

  // Validate optional source field from form data
  const sourceRaw = formData.get('source');
  const parsed = documentUploadSchema.safeParse({ source: sourceRaw || undefined });
  if (!parsed.success) {
    return Response.json({ error: 'Source dokumen tidak valid.' }, { status: 400 });
  }

  // Tentukan source berdasarkan role
  let source;
  if (user.role === 'CUSTOMER') {
    source = 'CLIENT'; // Customer selalu CLIENT
  } else if (user.role === 'CONSULTANT') {
    source = parsed.data.source || 'CONSULTANT_GENERATED';
    if (source === 'CLIENT') {
      return Response.json({ error: 'Konsultan tidak dapat mengunggah dokumen atas nama klien.' }, { status: 403 });
    }
  } else {
    // ADMIN bebas
    source = parsed.data.source || 'CLIENT';
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'bin';
  const fileKey = `cases/${caseId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    const savedPath = await saveFileBuffer({
      bucketName: process.env.S3_BUCKET_NAME || 'lbh-sthm-docs',
      key: fileKey,
      body: buffer,
      contentType: file.type || 'application/octet-stream',
    });

    // Simpan record ke database
    const document = await prisma.document.create({
      data: {
        caseId,
        uploaderId: user.id,
        fileUrl: savedPath,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        source,
        isGenerated: false,
      },
      include: { uploader: { select: { id: true, name: true } } },
    });

    return Response.json({ document }, { status: 201 });
  } catch (uploadError) {
    console.error('File upload failed:', uploadError);
    return Response.json({ error: 'Gagal mengunggah file ke storage.' }, { status: 500 });
  }
}

/**
 * GET /api/cases/:id/documents — Daftar dokumen case
 * RBAC:
 *   CUSTOMER  → hanya case miliknya, melihat CLIENT & CONSULTANT_GENERATED (Legal Opinion)
 *   CONSULTANT → hanya case ditugaskan, semua source
 *   ADMIN → bebas semua
 */
export async function GET(request, { params }) {
  const { user, error } = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: { consultant: { select: { userId: true } } },
  });
  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  // RBAC: cek kepemilikan
  if (user.role === 'CUSTOMER' && caseRecord.clientId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }
  if (user.role === 'CONSULTANT' && caseRecord.consultant?.userId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  // Filter source berdasarkan role
  const where = { caseId };
  if (user.role === 'CUSTOMER') {
    where.source = { in: ['CLIENT', 'CONSULTANT_GENERATED'] };
  }

  const documents = await prisma.document.findMany({
    where,
    include: { uploader: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ documents });
}
