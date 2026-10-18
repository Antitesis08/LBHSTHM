import { requireRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  role: z.enum(['CUSTOMER', 'CONSULTANT', 'ADMIN', 'SEKRETARIS', 'BENDAHARA', 'PARALEGAL', 'PENGAWAS']),
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  phone: z.string().optional(),
  consultantData: z.object({
    type: z.enum(['PENGACARA_PUBLIK', 'ADVOKAT']),
    bio: z.string().optional(),
    specialization: z.array(z.string()).optional()
  }).optional()
});

export async function GET(request) {
  const auth = await requireRole(['ADMIN']);
  if (auth.error) return auth.error;

  const users = await prisma.user.findMany({
    include: {
      consultantProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ users });
}

export async function POST(request) {
  const auth = await requireRole(['ADMIN']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    
    if (!parsed.success) {
      return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { role, name, email, password, phone, consultantData } = parsed.data;

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json({ error: 'Email sudah terdaftar.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      phone,
      role,
      passwordHash: hashedPassword,
      provider: 'CREDENTIALS',
      hasManualPassword: true,
      isVerified: true, // Auto verify when created by Admin
    };

    if (role === 'CONSULTANT') {
      if (!consultantData) {
        return Response.json({ error: 'Data konsultan wajib diisi untuk role CONSULTANT' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: userData });
        await tx.consultantProfile.create({
          data: {
            userId: user.id,
            type: consultantData.type,
            bio: consultantData.bio,
            specialization: consultantData.specialization || [],
            isAvailable: true
          }
        });
      });
    } else {
      await prisma.user.create({ data: userData });
    }

    return Response.json({ message: 'User berhasil dibuat' }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return Response.json({ error: 'Terjadi kesalahan pada server saat membuat user.' }, { status: 500 });
  }
}
