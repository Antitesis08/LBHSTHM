import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';
import { saveFileBuffer } from '../../../../../lib/storage';

/**
 * POST /api/cases/:id/submit-completion
 * Konsultan hukum mengajukan penyelesaian perkara kepada Sekretaris LKBH
 * dengan melampirkan berkas bukti dokumen hasil (PDF) dan catatan ringkasan penanganan.
 * 
 * Menerima FormData:
 * - file: File (opsional jika selectedDocId ada)
 * - selectedDocId: string (opsional jika file ada)
 * - closingNotes: string (wajib, minimal 5 karakter)
 */
export async function POST(request, { params }) {
  const { user, error } = await requireRole(['CONSULTANT', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      consultant: { select: { userId: true, user: { select: { name: true } } } },
      client: { select: { id: true, name: true } },
    },
  });

  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  // RBAC check untuk konsultan
  if (user.role === 'CONSULTANT' && caseRecord.consultant?.userId !== user.id) {
    return Response.json({ error: 'Akses ditolak. Anda bukan konsultan yang ditugaskan.' }, { status: 403 });
  }

  // Parse multipart form data
  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return Response.json({ error: 'Format data pengajuan tidak valid.' }, { status: 400 });
  }

  const closingNotes = (formData.get('closingNotes') || '').toString().trim();
  const selectedDocId = (formData.get('selectedDocId') || '').toString().trim();
  const file = formData.get('file');

  if (!closingNotes || closingNotes.length < 5) {
    return Response.json({ error: 'Catatan ringkasan hasil perkara minimal 5 karakter.' }, { status: 400 });
  }

  let finalDocUrl = '';
  let finalDocName = '';

  // Opsi A: Menggunakan berkas dokumen resmi yang sudah ada di database
  if (selectedDocId) {
    const existingDoc = await prisma.document.findFirst({
      where: { id: selectedDocId, caseId },
    });
    if (!existingDoc) {
      return Response.json({ error: 'Dokumen terpilih tidak ditemukan pada perkara ini.' }, { status: 404 });
    }
    finalDocUrl = existingDoc.fileUrl;
    finalDocName = existingDoc.fileName;
  }
  // Opsi B: Mengunggah berkas baru (misal: PDF Berita Acara / Laporan Akhir / Putusan)
  else if (file && typeof file !== 'string') {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'pdf';
    const fileKey = `cases/${caseId}/closing/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    try {
      finalDocUrl = await saveFileBuffer({
        bucketName: process.env.S3_BUCKET_NAME || 'lbh-sthm-docs',
        key: fileKey,
        body: buffer,
        contentType: file.type || 'application/pdf',
      });
      finalDocName = file.name;

      // Catat sebagai dokumen resmi hasil konsultan
      await prisma.document.create({
        data: {
          caseId,
          uploaderId: user.id,
          fileUrl: finalDocUrl,
          fileName: finalDocName,
          fileType: file.type || 'application/pdf',
          source: 'CONSULTANT_GENERATED',
          isGenerated: false,
        },
      });
    } catch (uploadErr) {
      console.error('Closing document upload failed:', uploadErr);
      return Response.json({ error: 'Gagal mengunggah berkas dokumen hasil ke storage.' }, { status: 500 });
    }
  } else {
    return Response.json(
      { error: 'Wajib mengunggah dokumen hasil atau memilih dokumen resmi yang telah dibuat.' },
      { status: 400 }
    );
  }

  // Update status kasus ke MENUNGGU_VERIFIKASI_SEKRETARIS
  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: {
      status: 'MENUNGGU_VERIFIKASI_SEKRETARIS',
      closingNotes,
      closingDocUrl: finalDocUrl,
      closingDocName: finalDocName,
      closingSubmittedAt: new Date(),
      closingRejectionReason: null,
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { include: { user: { select: { name: true } } } },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  });

  // Notifikasi ke seluruh Sekretaris LKBH
  const sekretarisUsers = await prisma.user.findMany({
    where: { role: 'SEKRETARIS', isActive: true },
    select: { id: true },
  });

  const consultantName = caseRecord.consultant?.user?.name || user.name || 'Konsultan';
  for (const sek of sekretarisUsers) {
    await prisma.notification.create({
      data: {
        userId: sek.id,
        title: 'Verifikasi Berkas Hasil Perkara',
        body: `Konsultan ${consultantName} telah mengajukan dokumen hasil penyelesaian untuk perkara ${caseRecord.code}. Mohon ditelaah dan diverifikasi.`,
      },
    });
  }

  // Notifikasi ke Klien
  await prisma.notification.create({
    data: {
      userId: caseRecord.clientId,
      title: 'Penyelesaian Perkara Diajukan',
      body: `Konsultan Anda telah menyampaikan dokumen hasil penanganan perkara [${caseRecord.code}] ke Sekretariat LKBH untuk verifikasi akhir.`,
    },
  });

  return Response.json({
    message: 'Dokumen hasil penanganan perkara berhasil dikirimkan ke Sekretaris LKBH.',
    case: updatedCase,
  });
}
