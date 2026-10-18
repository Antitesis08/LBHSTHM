import { prisma } from '../../../lib/prisma';
import PengawasDashboardClient from './PengawasDashboardClient';

export default async function PengawasDashboardPage() {
  const cases = await prisma.case.findMany({
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { include: { user: { select: { name: true } } } },
      paralegal: { select: { name: true } },
      documents: { select: { id: true, fileType: true, fileName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalCases = cases.length;
  const registeredCases = cases.filter((c) => c.registrationNumber).length;
  const bagkCases = cases.filter((c) => c.bagkNumber).length;
  const conflictCheckedCases = cases.filter((c) => c.conflictOfInterestCheck).length;
  const archivedCases = cases.filter((c) => c.isArchived).length;
  const paralegalAssistedCases = cases.filter((c) => c.assignedParalegalId).length;

  const financialRecords = await prisma.financialRecord.findMany();
  let totalIncome = 0;
  let totalExpense = 0;
  financialRecords.forEach((r) => {
    if (r.type === 'INCOME') totalIncome += r.amount;
    else if (r.type === 'EXPENSE') totalExpense += r.amount;
  });

  const serializedCases = cases.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const metrics = {
    totalCases,
    registeredCases,
    bagkCases,
    conflictCheckedCases,
    archivedCases,
    paralegalAssistedCases,
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    sopCompliancePct: totalCases > 0 ? Math.round(((registeredCases + bagkCases + conflictCheckedCases) / (totalCases * 3)) * 100) : 100,
  };

  return <PengawasDashboardClient metrics={metrics} cases={serializedCases} />;
}
