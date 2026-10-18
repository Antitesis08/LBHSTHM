import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';
import { readJsonBody, registerSchema } from '../../../../lib/validators';
import { createSession } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const payload = await readJsonBody(request);
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const { name, email, phone, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return Response.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, phone, passwordHash }, select: { id: true, name: true, email: true, role: true } });
    await createSession(user);
    return Response.json({ user }, { status: 201 });
  } catch (error) { console.error(error); return Response.json({ error: 'Database belum terhubung atau konfigurasi server tidak valid.' }, { status: 500 }); }
}
