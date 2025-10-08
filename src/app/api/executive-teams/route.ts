import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 경영진 팀 구성 조회
export async function GET() {
  try {
    // 경영진 토너먼트 참가자들 조회
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
    });

    // 4개 팀으로 구성 (실제로는 별도 테이블이 필요하지만 임시로 처리)
    const teams = [
      { id: 1, name: '팀 1', members: [] as any[] },
      { id: 2, name: '팀 2', members: [] as any[] },
      { id: 3, name: '팀 3', members: [] as any[] },
      { id: 4, name: '팀 4', members: [] as any[] },
    ];

    return NextResponse.json({ users, teams });
  } catch (error) {
    console.error('Error fetching executive teams:', error);
    return NextResponse.json({ error: 'Failed to fetch executive teams' }, { status: 500 });
  }
}

// 팀 구성 업데이트
export async function POST(request: NextRequest) {
  // 관리자 권한 확인
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { teams } = body;

    // 실제로는 별도의 Team 테이블이 필요하지만, 
    // 현재는 TournamentMatch 테이블을 활용하여 팀 정보를 저장
    
    // 기존 경영진 토너먼트 매치들 삭제
    await prisma.tournamentMatch.deleteMany({
      where: {
        tournament: {
          type: 'EXECUTIVE'
        }
      }
    });

    // 경영진 토너먼트 찾기 또는 생성
    let executiveTournament = await prisma.tournament.findFirst({
      where: { type: 'EXECUTIVE' }
    });

    if (!executiveTournament) {
      executiveTournament = await prisma.tournament.create({
        data: {
          name: '경영진 토너먼트',
          type: 'EXECUTIVE',
          maxPlayers: 4,
          status: 'IN_PROGRESS'
        }
      });
    }

    // 4개 팀의 점수 입력을 위한 매치 생성
    for (let i = 0; i < 4; i++) {
      const team = teams[i];
      if (team && team.members.length > 0) {
        await prisma.tournamentMatch.create({
          data: {
            tournamentId: executiveTournament.id,
            round: 1,
            matchNumber: i + 1,
            player1Id: team.members[0]?.id || null, // 팀 대표자
            status: 'SCHEDULED'
          }
        });
      }
    }

    return NextResponse.json({ message: 'Teams updated successfully' });
  } catch (error) {
    console.error('Error updating teams:', error);
    return NextResponse.json({ error: 'Failed to update teams' }, { status: 500 });
  }
}

