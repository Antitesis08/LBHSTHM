import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';
import { generateDocSchema } from '../../../../../lib/validators';
import { saveFileBuffer } from '../../../../../lib/storage';
import { renderRingkasanKonsultasi } from '../../../../../lib/pdf/templates/ringkasanKonsultasi.jsx';
import { renderLegalOpinion } from '../../../../../lib/pdf/templates/legalOpinion.jsx';
import { renderSuratKuasa } from '../../../../../lib/pdf/templates/suratKuasa.jsx';
import { renderSomasi } from '../../../../../lib/pdf/templates/somasi.jsx';

// Template yang aktif saat ini (semua template resmi LKBH STHM kini aktif)
const ACTIVE_TEMPLATES = ['RINGKASAN_KONSULTASI', 'LEGAL_OPINION', 'SURAT_KUASA', 'SOMASI'];
const PENDING_TEMPLATES = [];

/**
 * POST /api/cases/:id/generate-doc — Generate PDF dokumen
 * RBAC:
 *   CUSTOMER → tidak boleh
 *   CONSULTANT → hanya case yang ditugaskan
 *   ADMIN → bebas semua
 *
 * Template aktif: RINGKASAN_KONSULTASI, LEGAL_OPINION
 * Template pending: SURAT_KUASA, SOMASI (return 501)
 */
export async function POST(request, { params }) {
  const { user, error } = await requireRole(['CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;

  // Validasi body
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const parsed = generateDocSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { templateType } = parsed.data;

  // Cek apakah template belum aktif
  if (PENDING_TEMPLATES.includes(templateType)) {
    return Response.json(
      { error: 'Template ini masih menunggu review advokat STHM, belum aktif.' },
      { status: 501 }
    );
  }

  // Ambil case + relasi
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  // RBAC: konsultan hanya case yang ditugaskan
  if (user.role === 'CONSULTANT' && caseRecord.consultant?.userId !== user.id) {
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  // Render PDF
  let pdfBuffer;
  let fileName;
  try {
    const caseData = {
      code: caseRecord.code,
      title: caseRecord.title,
      description: caseRecord.description,
      serviceType: caseRecord.serviceType || 'PENDAMPINGAN_HUKUM',
      status: caseRecord.status,
      clientName: caseRecord.client.name,
      clientEmail: caseRecord.client.email,
      consultantName: caseRecord.consultant?.user?.name || 'Tim LBH STHM',
      sprinNumber: caseRecord.sprinNumber || 'Sprin/LKBH-STHM/2026',
      notes: body.notes || caseRecord.consultationNotes || '',
      createdAt: caseRecord.createdAt,
    };

    if (templateType === 'RINGKASAN_KONSULTASI') {
      pdfBuffer = await renderRingkasanKonsultasi(caseData);
      fileName = `Ringkasan_Konsultasi_${caseRecord.code.replace(/\//g, '-')}.pdf`;
    } else if (templateType === 'LEGAL_OPINION') {
      pdfBuffer = await renderLegalOpinion(caseData);
      fileName = `Legal_Opinion_${caseRecord.code.replace(/\//g, '-')}.pdf`;
    } else if (templateType === 'SURAT_KUASA') {
      pdfBuffer = await renderSuratKuasa(caseData);
      fileName = `Surat_Kuasa_Khusus_${caseRecord.code.replace(/\//g, '-')}.pdf`;
    } else if (templateType === 'SOMASI') {
      pdfBuffer = await renderSomasi(caseData);
      fileName = `Somasi_${caseRecord.code.replace(/\//g, '-')}.pdf`;
    }
  } catch (renderError) {
    console.error('PDF render failed:', renderError);
    return Response.json({ error: 'Gagal membuat dokumen PDF.' }, { status: 500 });
  }

  const s3Key = `cases/${caseId}/generated/${Date.now()}-${fileName}`;
  let savedPath;
  try {
    savedPath = await saveFileBuffer({
      bucketName: process.env.S3_BUCKET_NAME || 'lbh-sthm-docs',
      key: s3Key,
      body: pdfBuffer,
      contentType: 'application/pdf',
    });
  } catch (uploadError) {
    console.error('Document save failed:', uploadError);
    return Response.json({ error: 'Gagal mengunggah dokumen ke storage.' }, { status: 500 });
  }

  // Simpan record
  const document = await prisma.document.create({
    data: {
      caseId,
      uploaderId: user.id,
      fileUrl: savedPath,
      fileName,
      fileType: 'application/pdf',
      source: 'CONSULTANT_GENERATED',
      isGenerated: true,
    },
    include: { uploader: { select: { id: true, name: true } } },
  });

  return Response.json({ document }, { status: 201 });
}
