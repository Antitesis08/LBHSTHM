import { prisma } from '../../../../lib/prisma';
import { requireRole } from '../../../../lib/auth';

/**
 * GET /api/finances/cases
 * Mengambil daftar beban biaya operasional per perkara (Lampiran F)
 * RBAC: BENDAHARA, ADMIN, PENGAWAS
 */
export async function GET(request) {
  const { user, error } = await requireRole(['BENDAHARA', 'ADMIN', 'PENGAWAS']);
  if (error) return error;

  const cases = await prisma.case.findMany({
    include: {
      client: { select: { name: true } },
      consultant: { include: { user: { select: { name: true } } } },
      expenses: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ cases });
}

/**
 * POST /api/finances/cases
 * Mencatat pengeluaran operasional untuk perkara tertentu
 * RBAC: BENDAHARA, ADMIN, CONSULTANT
 */
export async function POST(request) {
  const { user, error } = await requireRole(['BENDAHARA', 'ADMIN', 'CONSULTANT']);
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { caseId, amount, category, description, receiptUrl } = body;

  if (!caseId || !amount || !category || !description) {
    return Response.json(
      { error: 'ID Kasus, jumlah, kategori, dan deskripsi wajib diisi.' },
      { status: 400 }
    );
  }

  const foundCase = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, code: true, title: true },
  });

  if (!foundCase) {
    return Response.json({ error: 'Kasus tidak ditemukan.' }, { status: 404 });
  }

  const numAmount = parseFloat(amount);

  // 1. Simpan di CaseExpense
  const expense = await prisma.caseExpense.create({
    data: {
      caseId,
      amount: numAmount,
      category,
      description,
      receiptUrl: receiptUrl || null,
      createdById: user.id,
    },
  });

  // 2. Sinkronkan ke Buku Kas Utama (FinancialRecord)
  await prisma.financialRecord.create({
    data: {
      type: 'EXPENSE',
      category: `Operasional Perkara: ${foundCase.code}`,
      amount: numAmount,
      description: `[${foundCase.code}] ${description} (${category})`,
      proofUrl: receiptUrl || null,
      date: new Date(),
      recordedBy: user.name,
    },
  });

  return Response.json({ expense }, { status: 201 });
}
