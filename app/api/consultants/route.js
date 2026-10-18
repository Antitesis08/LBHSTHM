import { prisma } from '../../../lib/prisma';
import { requireRole } from '../../../lib/auth';

export async function GET(request) {
  const { user, error } = await requireRole();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const specialization = searchParams.get('specialization')?.trim();

  const consultants = await prisma.consultantProfile.findMany({
    where: specialization ? { specialization: { has: specialization } } : undefined,
    select: {
      id: true,
      type: true,
      specialization: true,
      bio: true,
      photoUrl: true,
      isAvailable: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { user: { name: 'asc' } },
  });

  return Response.json({
    consultants: consultants.map((item) => ({
      id: item.id,
      name: item.user.name,
      type: item.type,
      specialization: item.specialization,
      bio: item.bio,
      photoUrl: item.photoUrl,
      isAvailable: item.isAvailable,
    })),
  });
}
