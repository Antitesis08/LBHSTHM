import { prisma } from '../../../lib/prisma';
import LppmClient from './LppmClient';

export default async function PengawasLppmPage() {
  const cases = await prisma.case.findMany({
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { include: { user: { select: { name: true } } } },
      paralegal: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedCases = cases.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <LppmClient cases={serializedCases} />;
}
