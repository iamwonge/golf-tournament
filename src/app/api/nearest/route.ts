import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 니어핀 챌린지 기록 조회
export async function GET() {
  try {
    const records = await prisma.nearestRecord.findMany({
      orderBy: { accuracy: 'asc' }
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching nearest records:', error);
    return NextResponse.json({ error: 'Failed to fetch nearest records' }, { status: 500 });
  }
}

// 니어핀 챌린지 기록 생성 (독립 참가자)
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
    const { playerName, department, phone, email, distance, reachedDistance } = body;

    if (!playerName || !department || !distance) {
      return NextResponse.json({ error: 'Player name, department, and distance are required' }, { status: 400 });
    }

    const distanceToPin = parseFloat(distance); // 핀까지의 거리 (이미 계산된 값)
    
    const record = await prisma.nearestRecord.create({
      data: {
        playerName,
        department,
        phone: phone || null,
        email: email || null,
        distance: distanceToPin, // 핀까지의 거리
        accuracy: distanceToPin, // 니어핀은 핀까지의 거리가 정확도
      }
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating nearest record:', error);
    return NextResponse.json({ error: 'Failed to create nearest record' }, { status: 500 });
  }
}
