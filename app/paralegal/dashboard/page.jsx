import { getSessionUser } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import ParalegalDashboardClient from './ParalegalDashboardClient';

export default async function ParalegalDashboardPage() {
  const user = await getSessionUser();

  const whereClause =
    user?.role === 'PARALEGAL'
      ? { assignedParalegalId: user.id }
      : {};

  const cases = await prisma.case.findMany({
    where: whereClause,
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      consultant: { include: { user: { select: { name: true, email: true } } } },
      documents: { orderBy: { createdAt: 'desc' } },
      hearings: { orderBy: { date: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedCases = cases.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    documents: c.documents.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
    hearings: c.hearings.map((h) => ({
      ...h,
      date: h.date.toISOString(),
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  return <ParalegalDashboardClient cases={serializedCases} user={user} />;
}
