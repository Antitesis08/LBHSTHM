import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';
import { reviewCompletionSchema } from '../../../../../lib/validators';

/**
 * POST /api/cases/:id/review-completion
 * Sekretaris LKBH (atau Admin) meninjau dokumen hasil perkara yang diajukan konsultan:
 * - action = 'ACC'   -> Perkara resmi berstatus SELESAI
 * - action = 'REJECT'-> Perkara dikembalikan ke PROSES dengan catatan alasan penolakan
 */
export async function POST(request, { params }) {
  const { user, error } = await requireRole(['SEKRETARIS', 'ADMIN']);
  if (error) return error;

  const { id: caseId } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const parsed = reviewCompletionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { action, rejectionReason } = parsed.data;

  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      consultant: { include: { user: { select: { id: true, name: true, email: true } } } },
      client: { select: { id: true, name: true, email: true } },
    },
  });

  if (!caseRecord) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  if (caseRecord.status !== 'MENUNGGU_VERIFIKASI_SEKRETARIS') {
    return Response.json(
      { error: `Kasus ini berstatus ${caseRecord.status}, bukan menunggu verifikasi sekretaris.` },
      { status: 409 }
    );
  }

  if (action === 'ACC') {
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'SELESAI',
        closingApprovedAt: new Date(),
        closingApprovedById: user.id,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        consultant: { include: { user: { select: { name: true } } } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Notifikasi ke Klien
    await prisma.notification.create({
      data: {
        userId: caseRecord.clientId,
        title: 'Penanganan Perkara Resmi Selesai (ACC)',
        body: `Perkara Anda [${caseRecord.code}] telah diverifikasi dan disetujui (ACC) oleh Sekretariat LKBH STHM sebagai perkara selesai/tuntas.`,
      },
    });

    // Notifikasi ke Konsultan
    if (caseRecord.consultant?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: caseRecord.consultant.user.id,
          title: 'Berkas Hasil Perkara Disetujui (ACC)',
          body: `Dokumen hasil perkara [${caseRecord.code}] telah disetujui (ACC) oleh Sekretaris LKBH. Perkara resmi berstatus SELESAI.`,
        },
      });
    }

    return Response.json({
      message: 'Berkas hasil penanganan perkara berhasil disetujui (ACC). Perkara resmi SELESAI.',
      case: updatedCase,
    });
  } else if (action === 'REJECT') {
    const reasonText = (rejectionReason || '').trim();
    if (!reasonText) {
      return Response.json({ error: 'Alasan penolakan / revisi berkas wajib diisi.' }, { status: 400 });
    }

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'PROSES',
        closingRejectionReason: reasonText,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        consultant: { include: { user: { select: { name: true } } } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Notifikasi ke Konsultan agar segera merevisi
    if (caseRecord.consultant?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: caseRecord.consultant.user.id,
          title: 'Permintaan Perbaikan Berkas Hasil Perkara',
          body: `Sekretaris LKBH meminta revisi berkas hasil untuk perkara [${caseRecord.code}]. Catatan: "${reasonText}". Status dikembalikan ke PROSES.`,
        },
      });
    }

    return Response.json({
      message: 'Pengajuan berkas ditolak dan dikembalikan ke konsultan untuk direvisi.',
      case: updatedCase,
    });
  }

  return Response.json({ error: 'Aksi verifikasi tidak valid.' }, { status: 400 });
}
