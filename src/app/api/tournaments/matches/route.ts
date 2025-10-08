import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 경기 배정 API
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
    const { matchId, player1Id, player2Id } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    // 기존 매치가 있는지 확인
    const existingMatch = await prisma.tournamentMatch.findUnique({
      where: { id: matchId }
    });

    if (existingMatch) {
      // 기존 매치 업데이트
      const updatedMatch = await prisma.tournamentMatch.update({
        where: { id: matchId },
        data: {
          player1Id: player1Id || null,
          player2Id: player2Id || null,
          status: (!player2Id && player1Id) ? 'BYE' : 'SCHEDULED'
        }
      });
      return NextResponse.json(updatedMatch);
    } else {
      // 본부별 토너먼트 찾기 또는 생성
      let departmentTournament = await prisma.tournament.findFirst({
        where: { type: 'DEPARTMENT' }
      });

      if (!departmentTournament) {
        departmentTournament = await prisma.tournament.create({
          data: {
            name: '본부별 토너먼트',
            type: 'DEPARTMENT',
            maxPlayers: 16,
            status: 'IN_PROGRESS'
          }
        });
      }

      // 새 매치 생성
      const newMatch = await prisma.tournamentMatch.create({
        data: {
          id: matchId,
          tournamentId: departmentTournament.id,
          round: 1,
          matchNumber: parseInt(matchId.split('_')[2]?.replace('m', '') || '1'),
          player1Id: player1Id || null,
          player2Id: player2Id || null,
          status: (!player2Id && player1Id) ? 'BYE' : 'SCHEDULED'
        }
      });
      return NextResponse.json(newMatch);
    }
  } catch (error) {
    console.error('Error assigning match:', error);
    return NextResponse.json({ error: 'Failed to assign match' }, { status: 500 });
  }
}

// 경기 업데이트 API
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, ...updateData } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    const updatedMatch = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: updateData
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}
