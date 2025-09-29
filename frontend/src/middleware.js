import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get("accessToken")?.value;
  
  // Debug logging
  console.log('🔍 Middleware check:', {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    token: token ? `${token.substring(0, 20)}...` : 'none',
    allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value ? `${c.value.substring(0, 10)}...` : 'empty']))
  });

  // If no token, redirect to login
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('✅ Token found, allowing access');
  return NextResponse.next();
}

// Only apply middleware to these paths:
export const config = {
  matcher: ['/students/:path*', '/instructor/:path*', '/admin/:path*'],
};
