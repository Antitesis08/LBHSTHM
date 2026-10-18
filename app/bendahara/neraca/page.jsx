import { prisma } from '../../../lib/prisma';
import NeracaClient from './NeracaClient';

export default async function BendaharaNeracaPage() {
  const records = await prisma.financialRecord.findMany({
    orderBy: { date: 'asc' },
  });

  const serializedRecords = records.map((r) => ({
    ...r,
    date: r.date.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));

  return <NeracaClient records={serializedRecords} />;
}
