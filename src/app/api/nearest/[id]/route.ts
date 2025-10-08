import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 니어핀 챌린지 기록 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 관리자 권한 확인
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { playerName, department, phone, email, distance } = body;
    const { id } = await params;
    const actualDistance = parseFloat(distance);

    const record = await prisma.nearestRecord.update({
      where: { id },
      data: {
        playerName,
        department,
        phone: phone || null,
        email: email || null,
        distance: actualDistance,
        accuracy: actualDistance, // 니어핀은 거리 자체가 정확도
      }
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating nearest record:', error);
    return NextResponse.json({ error: 'Failed to update nearest record' }, { status: 500 });
  }
}

// 니어핀 챌린지 기록 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 관리자 권한 확인
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    await prisma.nearestRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Nearest record deleted successfully' });
  } catch (error) {
    console.error('Error deleting nearest record:', error);
    return NextResponse.json({ error: 'Failed to delete nearest record' }, { status: 500 });
  }
}
