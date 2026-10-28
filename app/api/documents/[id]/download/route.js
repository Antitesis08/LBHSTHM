import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';
import { s3, isS3Configured } from '../../../../../lib/storage';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * GET /api/documents/:id/download — Presigned URL untuk download dokumen
 * RBAC:
 *   CUSTOMER  → hanya dokumen dari case miliknya (CLIENT & CONSULTANT_GENERATED / Legal Opinion)
 *   CONSULTANT → hanya dokumen dari case yang ditugaskan
 *   ADMIN → bebas semua
 */
export async function GET(request, { params }) {
  const { user, error } = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN', 'SEKRETARIS', 'PARALEGAL', 'PENGAWAS']);
  if (error) return error;

  const { id: documentId } = await params;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      case: {
        include: { consultant: { select: { userId: true } } },
      },
    },
  });

  if (!document) {
    return Response.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 });
  }

  // RBAC: cek kepemilikan via case
  if (user.role === 'CUSTOMER') {
    if (document.case.clientId !== user.id) {
      return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
    }
  }
  if (user.role === 'CONSULTANT') {
    if (document.case.consultant?.userId !== user.id) {
      return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
    }
  }

  // Handle local filesystem downloads
  if (document.fileUrl.startsWith('/uploads/') || !isS3Configured) {
    return Response.json({
      url: document.fileUrl.startsWith('/') ? document.fileUrl : `/${document.fileUrl}`,
      fileName: document.fileName,
      fileType: document.fileType,
    });
  }

  // Generate presigned URL (berlaku 15 menit)
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'lbh-sthm-docs',
      Key: document.fileUrl,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 900 });

    return Response.json({
      url,
      fileName: document.fileName,
      fileType: document.fileType,
    });
  } catch (downloadError) {
    console.error('S3 presigned URL failed:', downloadError);
    return Response.json({ error: 'Gagal menghasilkan tautan unduhan.' }, { status: 500 });
  }
}
