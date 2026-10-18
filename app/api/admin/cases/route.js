import { prisma } from '../../../../lib/prisma';
import { requireRole } from '../../../../lib/auth';

export async function GET(request) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status')?.trim();

  const cases = await prisma.case.findMany({
    where: status ? { status: status } : undefined,
    include: {
      client: { select: { id: true, name: true, email: true } },
      consultant: { select: { id: true, type: true, user: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ cases });
}
