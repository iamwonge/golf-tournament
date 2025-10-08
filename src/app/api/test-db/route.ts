import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 데이터베이스 연결 테스트
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // 테이블 존재 확인
    const userCount = await prisma.user.count();
    const matchCount = await prisma.tournamentMatch.count();
    const tournamentCount = await prisma.tournament.count();
    
    return NextResponse.json({
      status: 'success',
      database: 'connected',
      tables: {
        users: userCount,
        matches: matchCount,
        tournaments: tournamentCount
      },
      testQuery: result
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
