import { prisma } from '../../../lib/prisma';
import KepatuhanClient from './KepatuhanClient';

export default async function PengawasKepatuhanPage() {
  const cases = await prisma.case.findMany({
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { include: { user: { select: { name: true } } } },
      paralegal: { select: { name: true } },
      documents: { select: { id: true, fileType: true, fileName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedCases = cases.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <KepatuhanClient cases={serializedCases} />;
}
