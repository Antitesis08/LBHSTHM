import { prisma } from '../../../lib/prisma';
import { requireRole } from '../../../lib/auth';

/**
 * GET /api/finances
 * Laporan Keuangan Lembaga sesuai Lampiran F
 * RBAC: BENDAHARA, ADMIN, PENGAWAS
 */
export async function GET(request) {
  const { user, error } = await requireRole(['BENDAHARA', 'ADMIN', 'PENGAWAS']);
  if (error) return error;

  const records = await prisma.financialRecord.findMany({
    orderBy: { date: 'desc' },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  records.forEach((r) => {
    if (r.type === 'INCOME') totalIncome += r.amount;
    else if (r.type === 'EXPENSE') totalExpense += r.amount;
  });

  const netBalance = totalIncome - totalExpense;

  // Breakdown per category
  const categories = {};
  records.forEach((r) => {
    if (!categories[r.category]) {
      categories[r.category] = { category: r.category, type: r.type, total: 0, count: 0 };
    }
    categories[r.category].total += r.amount;
    categories[r.category].count += 1;
  });

  return Response.json({
    records,
    summary: {
      totalIncome,
      totalExpense,
      netBalance,
      breakdown: Object.values(categories),
    },
  });
}

/**
 * POST /api/finances
 * Menambah catatan kas masuk / kas keluar LKBH
 * RBAC: BENDAHARA atau ADMIN
 */
export async function POST(request) {
  const { user, error } = await requireRole(['BENDAHARA', 'ADMIN']);
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { type, category, amount, description, proofUrl, date } = body;

  if (!type || !category || !amount || !description) {
    return Response.json(
      { error: 'Tipe (INCOME/EXPENSE), kategori, jumlah, dan uraian wajib diisi.' },
      { status: 400 }
    );
  }

  const record = await prisma.financialRecord.create({
    data: {
      type,
      category: category.trim(),
      amount: parseFloat(amount),
      description: description.trim(),
      proofUrl: proofUrl || null,
      date: date ? new Date(date) : new Date(),
      recordedBy: user.name,
    },
  });

  return Response.json({ record }, { status: 201 });
}
