import { prisma } from '../../../lib/prisma';
import GelarKasusClient from './GelarKasusClient';

export default async function GelarKasusPage() {
  const cases = await prisma.case.findMany({
    where: {
      status: { in: ['DIAJUKAN', 'DIVERIFIKASI'] },
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      documents: true,
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
  }));

  return <GelarKasusClient cases={serializedCases} />;
}
