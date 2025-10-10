import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. 기본 데이터베이스 연결 테스트
    console.log('Testing database connection...');
    
    // 2. 간단한 쿼리 실행
    const userCount = await prisma.user.count();
    const photoCount = await prisma.photo.count();
    
    // 3. Photo 테이블 스키마 확인
    const photos = await prisma.photo.findMany({
      take: 1,
      select: {
        id: true,
        title: true,
        fileName: true,
        createdAt: true
      }
    });
    
    console.log('Database connection successful');
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection working',
      data: {
        userCount,
        photoCount,
        samplePhoto: photos[0] || null,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}