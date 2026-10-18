import { prisma } from '../../../../lib/prisma';
import { requireRole } from '../../../../lib/auth';
import { uploadBufferToStorage } from '../../../../lib/storage';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const { user, error } = await requireRole(['ADMIN']);
  if (error) return error;

  const formData = await request.formData();
  const name = (formData.get('name') || '').toString().trim();
  const email = (formData.get('email') || '').toString().trim().toLowerCase();
  const type = (formData.get('type') || 'PENGACARA_PUBLIK').toString().trim();
  const bio = (formData.get('bio') || '').toString().trim();
  const specializationRaw = formData.get('specialization') || '[]';
  const photo = formData.get('photo');

  if (!name || !email) {
    return Response.json({ error: 'Nama dan email wajib diisi.' }, { status: 400 });
  }

  let specialization = [];
  try {
    specialization = JSON.parse(specializationRaw.toString());
  } catch {
    specialization = [];
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return Response.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
  }

  const temporaryPassword = Math.random().toString(36).slice(2, 10) + 'A1!';

  const created = await prisma.$transaction(async (tx) => {
    const userRecord = await tx.user.create({
      data: {
        name,
        email,
        role: 'CONSULTANT',
        passwordHash: await bcrypt.hash(temporaryPassword, 12),
        provider: 'CREDENTIALS',
        isVerified: false,
      },
      select: { id: true, email: true, name: true },
    });

    let photoUrl = null;
    if (photo && typeof photo !== 'string' && photo instanceof File) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const key = `avatars/${userRecord.id}-${Date.now()}-${photo.name.replace(/\s+/g, '-').toLowerCase()}`;
      photoUrl = await uploadBufferToStorage({ bucketName: process.env.S3_BUCKET_NAME || 'avatars', key, body: buffer, contentType: photo.type || 'image/jpeg', publicRead: true });
    }

    const profile = await tx.consultantProfile.create({
      data: {
        userId: userRecord.id,
        type: type === 'ADVOKAT' ? 'ADVOKAT' : 'PENGACARA_PUBLIK',
        specialization,
        bio: bio || null,
        photoUrl,
      },
      select: { id: true, userId: true },
    });

    return { user: userRecord, profile };
  });

  return Response.json({
    message: 'Konsultan berhasil dibuat. Password sementara: ' + temporaryPassword + ' (TODO: kirim email undangan nanti).',
    consultant: created.profile,
  }, { status: 201 });
}
