import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 퍼팅게임 기록 수정
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
    const targetDistance = 19.74;
    const actualDistance = parseFloat(distance);
    const calculatedAccuracy = Math.abs(actualDistance - targetDistance);

    const record = await prisma.puttingRecord.update({
      where: { id },
      data: {
        playerName,
        department,
        phone: phone || null,
        email: email || null,
        distance: actualDistance,
        accuracy: calculatedAccuracy,
      }
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating putting record:', error);
    return NextResponse.json({ error: 'Failed to update putting record' }, { status: 500 });
  }
}

// 퍼팅게임 기록 삭제
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
    await prisma.puttingRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Putting record deleted successfully' });
  } catch (error) {
    console.error('Error deleting putting record:', error);
    return NextResponse.json({ error: 'Failed to delete putting record' }, { status: 500 });
  }
}
