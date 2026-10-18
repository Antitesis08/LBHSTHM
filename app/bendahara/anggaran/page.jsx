import { prisma } from '../../../lib/prisma';
import AnggaranClient from './AnggaranClient';

export default async function BendaharaAnggaranPage() {
  const cases = await prisma.case.findMany({
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { include: { user: { select: { name: true } } } },
      expenses: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedCases = cases.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    expenses: c.expenses.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
  }));

  return <AnggaranClient initialCases={serializedCases} />;
}
