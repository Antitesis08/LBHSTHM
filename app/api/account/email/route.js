import { requireRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const emailUpdateSchema = z.object({
  newEmail: z.string().email('Email tidak valid'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password minimal 8 karakter').optional(),
});

export async function PATCH(request) {
  const auth = await requireRole(['CUSTOMER', 'CONSULTANT', 'ADMIN']);
  if (auth.error) return auth.error;

  const user = auth.user;

  try {
    const body = await request.json();
    const parsed = emailUpdateSchema.safeParse(body);
    
    if (!parsed.success) {
      return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { newEmail, currentPassword, newPassword } = parsed.data;

    // Fetch latest user data
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    
    const isGoogleNoPassword = dbUser.provider === 'GOOGLE' && !dbUser.hasManualPassword;

    let updateData = { email: newEmail };

    if (isGoogleNoPassword) {
      if (!newPassword) {
        return Response.json({ error: 'Password baru wajib diisi untuk akun Google.' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.passwordHash = hashedPassword;
      updateData.hasManualPassword = true;
    } else {
      if (!currentPassword) {
        return Response.json({ error: 'Password saat ini wajib diisi.' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!isMatch) {
        return Response.json({ error: 'Password saat ini tidak cocok.' }, { status: 401 });
      }
    }

    // Check if new email already in use
    if (newEmail !== dbUser.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: newEmail } });
      if (existingUser) {
        return Response.json({ error: 'Email sudah digunakan oleh akun lain.' }, { status: 400 });
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return Response.json({ message: 'Email berhasil diubah' });
  } catch (error) {
    console.error('Update email error:', error);
    return Response.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
