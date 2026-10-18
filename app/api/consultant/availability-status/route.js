import { prisma } from '../../../../lib/prisma';
import { requireRole } from '../../../../lib/auth';

export async function PATCH(request) {
  const { user, error } = await requireRole(['CONSULTANT']);
  if (error) return error;

  try {
    const { isAvailable } = await request.json();
    if (typeof isAvailable !== 'boolean') {
      return Response.json({ error: 'Status tidak valid.' }, { status: 400 });
    }

    const updatedProfile = await prisma.consultantProfile.update({
      where: { userId: user.id },
      data: { isAvailable },
    });

    return Response.json({ profile: updatedProfile });
  } catch (err) {
    return Response.json({ error: 'Gagal memperbarui status.' }, { status: 500 });
  }
}
