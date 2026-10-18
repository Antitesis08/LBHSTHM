import { getSessionUser } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import ObservasiClient from './ObservasiClient';

export default async function ParalegalObservasiPage() {
  const user = await getSessionUser();

  const whereClause =
    user?.role === 'PARALEGAL'
      ? { case: { assignedParalegalId: user.id } }
      : {};

  const hearings = await prisma.caseHearing.findMany({
    where: whereClause,
    include: {
      case: {
        select: {
          id: true,
          code: true,
          title: true,
          client: { select: { name: true } },
          consultant: { include: { user: { select: { name: true } } } },
        },
      },
    },
    orderBy: { date: 'asc' },
  });

  const serializedHearings = hearings.map((h) => ({
    ...h,
    date: h.date.toISOString(),
    createdAt: h.createdAt.toISOString(),
  }));

  return <ObservasiClient initialHearings={serializedHearings} user={user} />;
}
