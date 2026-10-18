import { requireRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').optional(),
  email: z.string().email('Email tidak valid').optional(),
  phone: z.string().optional(),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter').optional(),
  // For consultants
  bio: z.string().optional(),
  specialization: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
});

export async function PATCH(request, context) {
  const auth = await requireRole(['ADMIN']);
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, phone, newPassword, bio, specialization, isAvailable } = parsed.data;

    // Fetch user to check role
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { consultantProfile: true }
    });

    if (!targetUser) {
      return Response.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    if (newPassword) {
      const bcrypt = require('bcryptjs');
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
      updateData.hasManualPassword = true;
    }

    // Handle consultant-specific updates
    if (targetUser.role === 'CONSULTANT' && targetUser.consultantProfile) {
      const consultantUpdate = {};
      if (bio !== undefined) consultantUpdate.bio = bio;
      if (specialization !== undefined) consultantUpdate.specialization = specialization;
      if (isAvailable !== undefined) consultantUpdate.isAvailable = isAvailable;

      if (Object.keys(consultantUpdate).length > 0) {
        updateData.consultantProfile = {
          update: consultantUpdate
        };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return Response.json({ error: 'Email sudah terdaftar.' }, { status: 400 });
    }
    return Response.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const auth = await requireRole(['ADMIN']);
  if (auth.error) return auth.error;

  const { id } = await context.params;

  if (id === auth.user.id) {
    return Response.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri.' }, { status: 403 });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            casesAsClient: true,
          }
        },
        consultantProfile: {
          include: {
            _count: {
              select: {
                casesAssigned: true,
              }
            }
          }
        }
      }
    });

    if (!targetUser) {
      return Response.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const hasCasesAsClient = targetUser._count.casesAsClient > 0;
    const hasCasesAsConsultant = targetUser.consultantProfile ? targetUser.consultantProfile._count.casesAssigned > 0 : false;

    if (hasCasesAsClient || hasCasesAsConsultant) {
      // Soft delete
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });
      return Response.json({ message: 'User berhasil dinonaktifkan.', softDeleted: true });
    } else {
      // Hard delete (Prisma cascade on user deletion does not automatically happen unless @relation(onDelete: Cascade) is set)
      // Since it's not set in schema.prisma, we must manually delete the consultantProfile first
      if (targetUser.consultantProfile) {
        await prisma.consultantProfile.delete({ where: { userId: id } });
      }
      
      // Also delete related records that might block deletion (Messages, Notifications, Documents without Case?)
      // Actually, if they don't have a case, they might still have messages or notifications. Let's delete them.
      await prisma.notification.deleteMany({ where: { userId: id } });
      await prisma.message.deleteMany({ where: { senderId: id } });
      await prisma.document.deleteMany({ where: { uploaderId: id } });

      await prisma.user.delete({ where: { id } });
      return Response.json({ message: 'User berhasil dihapus permanen.', softDeleted: false });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json({ error: 'Terjadi kesalahan pada server saat menghapus user.' }, { status: 500 });
  }
}
