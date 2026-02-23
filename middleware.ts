import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // On Vercel (production), rewrite homepage to /install
  // Locally, serve the dashboard as-is
  if (request.nextUrl.pathname === '/') {
    const isVercel = process.env.VERCEL === '1';
    if (isVercel) {
      return NextResponse.rewrite(new URL('/install', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
