import { redirect } from 'next/navigation';
import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import VerifikasiBerkasClient from './VerifikasiBerkasClient';

export const metadata = {
  title: 'Verifikasi Berkas Hasil Perkara | LKBH STHM',
  description: 'Penelaahan dan persetujuan (ACC) berkas penyelesaian perkara oleh Sekretariat LKBH STHM.',
};

export default async function VerifikasiBerkasPage() {
  const { user, error } = await requireRole(['SEKRETARIS', 'ADMIN']);
  if (error) redirect('/unauthorized');

  // Ambil kasus yang sedang menunggu verifikasi sekretaris
  const pendingCases = await prisma.case.findMany({
    where: {
      status: 'MENUNGGU_VERIFIKASI_SEKRETARIS',
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      consultant: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { closingSubmittedAt: 'desc' },
  });

  // Ambil riwayat kasus yang sudah pernah di-ACC dan selesai
  const historyCases = await prisma.case.findMany({
    where: {
      status: 'SELESAI',
      closingApprovedAt: { not: null },
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      consultant: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { closingApprovedAt: 'desc' },
    take: 30,
  });

  const serialize = (cases) =>
    cases.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      closingSubmittedAt: c.closingSubmittedAt ? c.closingSubmittedAt.toISOString() : null,
      closingApprovedAt: c.closingApprovedAt ? c.closingApprovedAt.toISOString() : null,
      documents: c.documents.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      })),
    }));

  return (
    <VerifikasiBerkasClient
      pendingCases={serialize(pendingCases)}
      historyCases={serialize(historyCases)}
    />
  );
}
