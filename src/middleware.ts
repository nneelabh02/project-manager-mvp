// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname without the auth group prefix
  const pathname = req.nextUrl.pathname.replace(/^\/\(auth\)/, '');

  // If user is not signed in and the current path is not /login or /signup,
  // redirect the user to /login
  if (!session && !['/login', '/signup'].includes(pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If user is signed in and the current path is /login or /signup,
  // redirect the user to /dashboard
  if (session && ['/login', '/signup'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/projects/:path*',
    '/(auth)/login',
    '/(auth)/signup'
  ]
};
