import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 퍼팅게임 기록 조회
export async function GET() {
  try {
    const records = await prisma.puttingRecord.findMany({
      orderBy: { accuracy: 'asc' }
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching putting records:', error);
    return NextResponse.json({ error: 'Failed to fetch putting records' }, { status: 500 });
  }
}

// 퍼팅게임 기록 생성 (독립 참가자)
export async function POST(request: NextRequest) {
  // 관리자 권한 확인 (임시 비활성화)
  // if (!isAdmin(request)) {
  //   return NextResponse.json(
  //     { error: 'Unauthorized' },
  //     { status: 401 }
  //   );
  // }

  try {
    const body = await request.json();
    const { playerName, department, phone, email, distance, accuracy } = body;

    if (!playerName || !department || !distance) {
      return NextResponse.json({ error: 'Player name, department, and distance are required' }, { status: 400 });
    }

    const actualDistance = parseFloat(distance);
    const calculatedAccuracy = accuracy !== undefined ? parseFloat(accuracy) : Math.abs(actualDistance - 19.74);
    
    const record = await prisma.puttingRecord.create({
      data: {
        playerName,
        department,
        phone: phone || null,
        email: email || null,
        distance: actualDistance,
        accuracy: calculatedAccuracy,
      }
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating putting record:', error);
    return NextResponse.json({ error: 'Failed to create putting record' }, { status: 500 });
  }
}
