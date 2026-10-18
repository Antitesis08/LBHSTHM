import { redirect } from 'next/navigation';
import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import JadwalClient from './JadwalClient';

export default async function JadwalPage() {
  const { user, error } = await requireRole(['CONSULTANT']);
  if (error) redirect('/unauthorized');

  const profile = await prisma.consultantProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) redirect('/unauthorized');

  const schedules = await prisma.schedule.findMany({
    where: { consultantId: profile.id },
    include: {
      case: {
        select: {
          id: true,
          code: true,
          serviceType: true,
          status: true,
          client: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  // Serialize schedules
  const serializedSchedules = schedules.map(s => ({
    ...s,
    scheduledAt: s.scheduledAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <JadwalClient 
      initialSchedules={serializedSchedules} 
      initialIsAvailable={profile.isAvailable} 
    />
  );
}
