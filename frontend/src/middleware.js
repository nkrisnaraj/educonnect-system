import { NextResponse } from 'next/server';

export function middleware(request) {

  console.log("🔒 Middleware is running:", request.nextUrl.pathname);
  const token = request.cookies.get("accessToken")?.value;

  // Prepare the response
  const response = NextResponse.next();

  // Set CSP header to allow scripts from self and payhere sandbox
//   response.headers.set(
//   'Content-Security-Policy',
//   "script-src 'self' https://sandbox.payhere.lk https://payhere.lk 'unsafe-inline' 'unsafe-eval';"
// );

//   response.headers.set(
//   'Content-Security-Policy',
//   "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
// );


  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// Only apply middleware to these paths:
export const config = {
  matcher: ['/students/:path*', '/instructor/:path*', '/admin/:path*'],
};
