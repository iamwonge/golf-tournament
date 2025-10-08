import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 검증
    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: '잘못된 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const authSession = {
      isAuthenticated: true,
      isAdmin: true,
      timestamp: Date.now()
    };

    const token = generateToken(authSession);

    // 응답에 쿠키 설정
    const response = NextResponse.json(
      { 
        success: true, 
        message: '로그인 성공',
        user: { isAdmin: true }
      },
      { status: 200 }
    );

    // HttpOnly 쿠키로 토큰 설정 (24시간)
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24시간
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
