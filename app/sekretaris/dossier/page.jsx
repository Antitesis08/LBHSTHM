import { prisma } from '../../../lib/prisma';
import DossierClient from './DossierClient';

export default async function DossierPage() {
  const cases = await prisma.case.findMany({
    where: {
      status: 'SELESAI',
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { include: { user: { select: { name: true } } } },
      documents: true,
      hearings: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const serializedCases = cases.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    archivedAt: c.archivedAt ? c.archivedAt.toISOString() : null,
    documents: c.documents.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
    hearings: c.hearings.map((h) => ({
      ...h,
      date: h.date.toISOString(),
    })),
  }));

  return <DossierClient cases={serializedCases} />;
}
