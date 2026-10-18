import { prisma } from '../../../lib/prisma';
import BendaharaDashboardClient from './BendaharaDashboardClient';

export default async function BendaharaDashboardPage() {
  const records = await prisma.financialRecord.findMany({
    orderBy: { date: 'desc' },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  records.forEach((r) => {
    if (r.type === 'INCOME') totalIncome += r.amount;
    else if (r.type === 'EXPENSE') totalExpense += r.amount;
  });

  const serializedRecords = records.map((r) => ({
    ...r,
    date: r.date.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <BendaharaDashboardClient
      initialRecords={serializedRecords}
      summary={{
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      }}
    />
  );
}
