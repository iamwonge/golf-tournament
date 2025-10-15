import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 롱기스트 드라이브 기록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender');

    const whereClause = gender ? { gender } : {};
    
    const records = await prisma.longestRecord.findMany({
      where: whereClause,
      orderBy: { distance: 'desc' }
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching longest records:', error);
    return NextResponse.json({ error: 'Failed to fetch longest records' }, { status: 500 });
  }
}

// 롱기스트 드라이브 기록 생성 (독립 참가자)
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
    const { playerName, department, phone, email, distance, gender } = body;

    if (!playerName || !department || !distance || !gender) {
      return NextResponse.json({ error: 'Player name, department, distance, and gender are required' }, { status: 400 });
    }

    if (!['MALE', 'FEMALE'].includes(gender)) {
      return NextResponse.json({ error: 'Gender must be MALE or FEMALE' }, { status: 400 });
    }

    const record = await prisma.longestRecord.create({
      data: {
        playerName,
        department,
        phone: phone || null,
        email: email || null,
        distance: parseFloat(distance),
        gender,
      }
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating longest record:', error);
    return NextResponse.json({ error: 'Failed to create longest record' }, { status: 500 });
  }
}
