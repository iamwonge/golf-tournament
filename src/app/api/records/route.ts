import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 기록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let records: any[] = [];

    if (type === 'LONGEST') {
      records = await prisma.longestRecord.findMany({
        orderBy: { distance: 'desc' }
      });
    } else if (type === 'PUTTING') {
      records = await prisma.puttingRecord.findMany({
        orderBy: { accuracy: 'asc' }
      });
    } else if (type === 'NEAREST') {
      records = await prisma.nearestRecord.findMany({
        orderBy: { accuracy: 'asc' }
      });
    } else {
      // 모든 기록 조회
      const [longest, putting, nearest] = await Promise.all([
        prisma.longestRecord.findMany(),
        prisma.puttingRecord.findMany(),
        prisma.nearestRecord.findMany()
      ]);
      
      records = [
        ...longest.map(r => ({ ...r, type: 'LONGEST' })),
        ...putting.map(r => ({ ...r, type: 'PUTTING' })),
        ...nearest.map(r => ({ ...r, type: 'NEAREST' }))
      ];
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

// POST 메서드는 더 이상 사용되지 않습니다.
// 각 게임별 전용 API (/api/longest, /api/putting, /api/nearest)를 사용하세요.

