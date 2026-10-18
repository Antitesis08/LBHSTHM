import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';
import { loginSchema, readJsonBody } from '../../../../lib/validators';
import { createSession } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const payload = await readJsonBody(request);
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) return Response.json({ error: 'Email atau kata sandi tidak valid.' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return Response.json({ error: 'Email atau kata sandi salah.' }, { status: 401 });
    if (user.isActive === false) return Response.json({ error: 'Akun Anda telah dinonaktifkan.' }, { status: 403 });
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    await createSession(safeUser);
    return Response.json({ user: safeUser });
  } catch (error) { console.error(error); return Response.json({ error: 'Database belum terhubung atau konfigurasi server tidak valid.' }, { status: 500 }); }
}
