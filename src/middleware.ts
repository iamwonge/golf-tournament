import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 어드민 페이지 보호 (로그인 페이지 제외)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // 쿠키에서 토큰 존재 여부만 확인 (JWT 검증은 클라이언트에서)
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 어드민 페이지 보호
    '/admin/:path*',
  ]
};
