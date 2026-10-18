import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'development-only-change-me');
const cookieName = 'lbh_session';

/**
 * Middleware that protects top‑level route namespaces based on user role.
 * It runs before any page/component rendering. If the user is not logged in
 * or their role does not match the requested prefix, they are redirected to
 * `/unauthorized` (or `/login` when not authenticated).
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that should bypass protection
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static files, favicon, etc.
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(cookieName)?.value;
  let user = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      user = { role: payload.role };
    } catch {
      user = null;
    }
  }

  // Not logged in → redirect to login page
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role‑based checks for the three main namespaces
  if (pathname.startsWith('/customer')) {
    if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } else if (pathname.startsWith('/consultant')) {
    if (user.role !== 'CONSULTANT' && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } else if (pathname.startsWith('/admin')) {
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // All checks passed – allow the request to continue
  return NextResponse.next();
}

// Apply middleware only to protected route groups
export const config = {
  matcher: ['/customer/:path*', '/consultant/:path*', '/admin/:path*'],
};
