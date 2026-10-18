import { prisma } from '../../../../lib/prisma';
import { requireRole } from '../../../../lib/auth';

export async function GET(request) {
  const { user, error } = await requireRole(['CONSULTANT']);
  if (error) return error;

  const profile = await prisma.consultantProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return Response.json({ error: 'Profil konsultan tidak ditemukan.' }, { status: 404 });
  }

  const schedules = await prisma.schedule.findMany({
    where: { consultantId: profile.id },
    include: {
      case: {
        select: {
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

  return Response.json({ schedules });
}
