import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);

    if (!auth?.isAuthenticated || !auth?.isAdmin) {
      return NextResponse.json(
        { isAuthenticated: false, isAdmin: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      isAuthenticated: true,
      isAdmin: true,
      timestamp: auth.timestamp
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { isAuthenticated: false, isAdmin: false },
      { status: 500 }
    );
  }
}
