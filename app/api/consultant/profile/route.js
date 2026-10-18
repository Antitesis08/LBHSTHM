import { prisma } from '../../../../lib/prisma';
import { requireRole } from '../../../../lib/auth';
import { uploadBufferToStorage } from '../../../../lib/storage';

export async function PATCH(request) {
  const { user, error } = await requireRole(['CONSULTANT']);
  if (error) return error;

  const formData = await request.formData();
  const bio = (formData.get('bio') || '').toString().trim();
  const specializationRaw = formData.get('specialization') || '[]';
  const photo = formData.get('photo');

  let specialization = [];
  try {
    specialization = JSON.parse(specializationRaw.toString());
  } catch {
    specialization = [];
  }

  const profile = await prisma.consultantProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return Response.json({ error: 'Profil konsultan tidak ditemukan.' }, { status: 404 });
  }

  let photoUrl = profile.photoUrl;
  if (photo && typeof photo !== 'string' && photo instanceof File) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const key = `avatars/${user.id}-${Date.now()}-${photo.name.replace(/\s+/g, '-').toLowerCase()}`;
    photoUrl = await uploadBufferToStorage({ bucketName: process.env.S3_BUCKET_NAME || 'avatars', key, body: buffer, contentType: photo.type || 'image/jpeg', publicRead: true });
  }

  const updatedProfile = await prisma.consultantProfile.update({
    where: { id: profile.id },
    data: {
      bio: bio || null,
      specialization,
      photoUrl,
    },
  });

  return Response.json({ profile: updatedProfile });
}
