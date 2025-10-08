import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 롱기스트 드라이브 기록 조회
export async function GET() {
  try {
    const records = await prisma.longestRecord.findMany({
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
    const { playerName, department, phone, email, distance } = body;

    if (!playerName || !department || !distance) {
      return NextResponse.json({ error: 'Player name, department, and distance are required' }, { status: 400 });
    }

    const record = await prisma.longestRecord.create({
      data: {
        playerName,
        department,
        phone: phone || null,
        email: email || null,
        distance: parseFloat(distance),
      }
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating longest record:', error);
    return NextResponse.json({ error: 'Failed to create longest record' }, { status: 500 });
  }
}
