import { NextResponse } from 'next/server';

export function middleware(request) {
   console.log("🔒 Middleware is running:", request.nextUrl.pathname);
  const token = request.cookies.get("accessToken")?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Only apply middleware to these paths:
export const config = {
  matcher: ['/students/:path*', '/instructor/:path*', '/admin/:path*'],
};
