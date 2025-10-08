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
    const { playerName, department, phone, email, distance, accuracy } = body;

    if (!playerName || !department || !distance || accuracy === undefined) {
      return NextResponse.json({ error: 'Player name, department, distance, and accuracy are required' }, { status: 400 });
    }

    const reachedDistance = parseFloat(distance); // 실제 도달한 거리
    const distanceToPin = parseFloat(accuracy); // 핀까지의 거리 (정확도)
    
    const record = await prisma.nearestRecord.create({
      data: {
        playerName,
        department,
        phone: phone || null,
        email: email || null,
        distance: reachedDistance, // 실제 도달한 거리
        accuracy: distanceToPin, // 핀까지의 거리 (정확도)
      }
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating nearest record:', error);
    return NextResponse.json({ error: 'Failed to create nearest record' }, { status: 500 });
  }
}
