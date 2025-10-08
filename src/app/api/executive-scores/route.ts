import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 경영진 팀 점수 조회
export async function GET() {
  try {
    const executiveTournament = await prisma.tournament.findFirst({
      where: { type: 'EXECUTIVE' },
      include: {
        matches: {
          include: {
            player1: true,
          },
          orderBy: { matchNumber: 'asc' }
        }
      }
    });

    if (!executiveTournament) {
      return NextResponse.json({ matches: [] });
    }

    return NextResponse.json({ matches: executiveTournament.matches });
  } catch (error) {
    console.error('Error fetching executive scores:', error);
    return NextResponse.json({ error: 'Failed to fetch executive scores' }, { status: 500 });
  }
}

// 팀 점수 업데이트
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
    const { matchId, score, teamName } = body;

    const match = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        player1Score: score,
        status: 'COMPLETED',
        playedAt: new Date(),
      },
      include: {
        player1: true,
      }
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error updating team score:', error);
    return NextResponse.json({ error: 'Failed to update team score' }, { status: 500 });
  }
}

