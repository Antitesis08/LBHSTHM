import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
});

export async function PATCH(request) {
  const auth = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN']);
  if (auth.error) return auth.error;

  const user = auth.user;

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    
    if (dbUser.hasManualPassword === false) {
      return Response.json({ error: 'Silakan atur email & password pertama Anda lewat form di atas.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = passwordUpdateSchema.safeParse(body);
    
    if (!parsed.success) {
      return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    const isMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!isMatch) {
      return Response.json({ error: 'Password saat ini tidak cocok.' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    return Response.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Update password error:', error);
    return Response.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
