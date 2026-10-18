import { prisma } from '../../../lib/prisma';
import { requireRole } from '../../../lib/auth';

export async function GET(request) {
  const auth = await requireRole(['ADMIN']);
  if (auth.error) return auth.error;
  
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role')?.trim().toUpperCase();

  const users = await prisma.user.findMany({
    where: role ? { role: role } : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return Response.json({ users });
}
