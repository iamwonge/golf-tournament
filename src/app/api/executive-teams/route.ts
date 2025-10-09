import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 경영진 팀 조회
export async function GET() {
  try {
    const teams = await prisma.executiveTeam.findMany({
      orderBy: [
        { score: 'asc' }, // 낮은 점수 순 (골프)
        { teamName: 'asc' }
      ]
    });

    const response = NextResponse.json(teams);
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  } catch (error) {
    console.error('Error fetching executive teams:', error);
    return NextResponse.json({ error: 'Failed to fetch executive teams' }, { status: 500 });
  }
}

// 경영진 팀 생성/업데이트
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
    const { 
      teamId,
      teamName, 
      executiveName, 
      managerName, 
      memberName, 
      score,
      status 
    } = body;

    if (!teamName || !executiveName || !managerName || !memberName) {
      return NextResponse.json({ 
        error: 'Team name, executive name, manager name, and member name are required' 
      }, { status: 400 });
    }

    let team;
    
    if (teamId) {
      // 기존 팀 업데이트
      team = await prisma.executiveTeam.update({
        where: { id: teamId },
        data: {
          teamName,
          executiveName,
          managerName,
          memberName,
          score: score !== undefined ? parseInt(score) : undefined,
          status: status || 'SCHEDULED'
        }
      });
    } else {
      // 새 팀 생성
      team = await prisma.executiveTeam.create({
        data: {
          teamName,
          executiveName,
          managerName,
          memberName,
          score: score !== undefined ? parseInt(score) : undefined,
          status: status || 'SCHEDULED'
        }
      });
    }

    const response = NextResponse.json(team, { status: teamId ? 200 : 201 });
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  } catch (error) {
    console.error('Error saving executive team:', error);
    return NextResponse.json({ error: 'Failed to save executive team' }, { status: 500 });
  }
}