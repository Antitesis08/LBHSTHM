import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { createSession } from '../../../lib/auth';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/?error=missing_code', request.url));

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        }
      }
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const supabaseUser = data?.user;
  const email = supabaseUser?.email;
  if (error || !supabaseUser || !email) {
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }

  const metadata = supabaseUser.user_metadata || {};
  const name = metadata.full_name || metadata.name || email.split('@')[0];
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, provider: 'GOOGLE', googleId: supabaseUser.id, role: 'CUSTOMER', isVerified: true },
      select: { id: true, name: true, email: true, role: true }
    });
    await createSession(user);
    const dest = user.role === 'CUSTOMER' ? '/customer/dashboard' : user.role === 'CONSULTANT' ? '/consultant/dashboard' : user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  } catch (databaseError) {
    console.error('Supabase OAuth user sync failed', databaseError);
    return NextResponse.redirect(new URL('/?error=oauth_database_sync_failed', request.url));
  }
}
