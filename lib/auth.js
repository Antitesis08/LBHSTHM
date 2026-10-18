import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'development-only-change-me');
const cookieName = 'lbh_session';

export async function createSession(user) {
  const token = await new SignJWT({ role: user.role, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuedAt().setExpirationTime('7d').sign(secret);
  const store = await cookies();
  store.set(cookieName, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
}

export async function getSessionUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, email: true, role: true, isActive: true } });
    if (!user || user.isActive === false) return null;
    return user;
  } catch { return null; }
}

export async function requireRole(roles) {
  const user = await getSessionUser();
  if (!user) return { error: Response.json({ error: 'Sesi diperlukan.' }, { status: 401 }) };
  if (roles && !roles.includes(user.role)) return { error: Response.json({ error: 'Akses ditolak.' }, { status: 403 }) };
  return { user };
}

export async function clearSession() { (await cookies()).delete(cookieName); }
