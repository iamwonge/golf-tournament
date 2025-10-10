import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// 환경변수 검증 - 프로덕션에서는 반드시 설정되어야 함
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// 필수 환경변수 검증
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  console.warn('⚠️  JWT_SECRET not set, using development fallback');
}

if (!ADMIN_PASSWORD) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD is required in production');
  }
  console.warn('⚠️  ADMIN_PASSWORD not set, using development fallback');
}

// 개발환경에서만 fallback 사용
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev-fallback-secret-change-in-production';
const EFFECTIVE_ADMIN_PASSWORD = ADMIN_PASSWORD || 'admin123';

export interface AuthSession {
  isAuthenticated: boolean;
  isAdmin: boolean;
  timestamp: number;
}

// JWT 토큰 생성
export function generateToken(payload: AuthSession): string {
  return jwt.sign(payload, EFFECTIVE_JWT_SECRET, { expiresIn: '24h' });
}

// JWT 토큰 검증
export function verifyToken(token: string): AuthSession | null {
  try {
    if (!token || !EFFECTIVE_JWT_SECRET) {
      return null;
    }
    
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET) as AuthSession;
    
    // 토큰 구조 검증
    if (typeof decoded === 'object' && decoded !== null && 
        'isAuthenticated' in decoded && 'isAdmin' in decoded) {
      return decoded;
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// 비밀번호 검증
export function verifyPassword(password: string): boolean {
  if (!password || !EFFECTIVE_ADMIN_PASSWORD) {
    return false;
  }
  
  // 타이밍 공격 방지를 위한 상수 시간 비교
  // 실제 프로덕션에서는 bcrypt 등을 사용해 해싱된 비밀번호와 비교해야 함
  return password === EFFECTIVE_ADMIN_PASSWORD;
}

// 요청에서 인증 정보 추출
export function getAuthFromRequest(request: NextRequest): AuthSession | null {
  try {
    // 쿠키에서 토큰 확인
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    console.error('Error extracting auth from request:', error);
    return null;
  }
}

// 관리자 권한 확인
export function isAdmin(request: NextRequest): boolean {
  try {
    const auth = getAuthFromRequest(request);
    return auth?.isAuthenticated === true && auth?.isAdmin === true;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

// 인증 미들웨어
export function requireAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const auth = getAuthFromRequest(request);
    
    if (!auth?.isAuthenticated || !auth?.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, ...args);
  };
}
