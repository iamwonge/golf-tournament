import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 특정 경영진 팀 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const team = await prisma.executiveTeam.findUnique({
      where: { id: params.id }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching executive team:', error);
    return NextResponse.json({ error: 'Failed to fetch executive team' }, { status: 500 });
  }
}

// 특정 경영진 팀 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 관리자 권한 확인 (임시 비활성화)
  // if (!isAdmin(request)) {
  //   return NextResponse.json(
  //     { error: 'Unauthorized' },
  //     { status: 401 }
  //   );
  // }

  try {
    const body = await request.json();
    const { teamName, executiveName, managerName, memberName, score, status } = body;

    const team = await prisma.executiveTeam.update({
      where: { id: params.id },
      data: {
        ...(teamName && { teamName }),
        ...(executiveName && { executiveName }),
        ...(managerName && { managerName }),
        ...(memberName && { memberName }),
        ...(score !== undefined && { score: parseInt(score) }),
        ...(status && { status })
      }
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating executive team:', error);
    return NextResponse.json({ error: 'Failed to update executive team' }, { status: 500 });
  }
}

// 특정 경영진 팀 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 관리자 권한 확인 (임시 비활성화)
  // if (!isAdmin(request)) {
  //   return NextResponse.json(
  //     { error: 'Unauthorized' },
  //     { status: 401 }
  //   );
  // }

  try {
    await prisma.executiveTeam.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting executive team:', error);
    return NextResponse.json({ error: 'Failed to delete executive team' }, { status: 500 });
  }
}
