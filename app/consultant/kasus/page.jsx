import { redirect } from 'next/navigation';
import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import ConsultantCasesClient from './ConsultantCasesClient';

export const metadata = {
  title: 'Kasus Ditugaskan | LKBH STHM',
  description: 'Daftar penugasan perkara oleh Kepala LKBH STHM kepada Konsultan Hukum.',
};

export default async function ConsultantCasesPage() {
  const { user, error } = await requireRole(['CONSULTANT']);
  if (error) redirect('/unauthorized');

  const consultantProfile = await prisma.consultantProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!consultantProfile) redirect('/unauthorized');

  const cases = await prisma.case.findMany({
    where: { consultantId: consultantProfile.id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      documents: { select: { id: true, fileName: true, source: true, isGenerated: true } },
      hearings: { select: { id: true, date: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedCases = cases.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    closingSubmittedAt: c.closingSubmittedAt ? c.closingSubmittedAt.toISOString() : null,
    closingApprovedAt: c.closingApprovedAt ? c.closingApprovedAt.toISOString() : null,
    hearings: (c.hearings || []).map((h) => ({
      ...h,
      date: h.date.toISOString(),
    })),
  }));

  return <ConsultantCasesClient cases={serializedCases} user={user} />;
}
