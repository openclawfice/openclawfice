import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    // Demo mode bypasses the landing page rewrite
    if (request.nextUrl.searchParams.get('demo') === 'true') {
      return NextResponse.next();
    }
    // On Vercel (production), serve the landing page as homepage
    const isVercel = process.env.VERCEL === '1';
    if (isVercel) {
      return NextResponse.rewrite(new URL('/landing', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
