import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 롱기스트 드라이브 기록 수정
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

    const record = await prisma.longestRecord.update({
      where: { id },
      data: {
        playerName,
        department,
        phone: phone || null,
        email: email || null,
        distance: parseFloat(distance),
      }
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating longest record:', error);
    return NextResponse.json({ error: 'Failed to update longest record' }, { status: 500 });
  }
}

// 롱기스트 드라이브 기록 삭제
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
    await prisma.longestRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Longest record deleted successfully' });
  } catch (error) {
    console.error('Error deleting longest record:', error);
    return NextResponse.json({ error: 'Failed to delete longest record' }, { status: 500 });
  }
}
