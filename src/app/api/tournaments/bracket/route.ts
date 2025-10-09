import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 16강 토너먼트 브래킷 생성 (16개 빈 슬롯)
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
    const { tournamentId } = body;

    // 본부별 토너먼트 찾기 또는 생성
    let tournament = await prisma.tournament.findFirst({
      where: { type: 'DEPARTMENT' }
    });

    if (!tournament) {
      tournament = await prisma.tournament.create({
        data: {
          name: '본부별 토너먼트',
          type: 'DEPARTMENT',
          maxPlayers: 16,
          status: 'IN_PROGRESS'
        }
      });
    }

    // 기존 경기 삭제
    await prisma.tournamentMatch.deleteMany({
      where: { tournamentId: tournament.id }
    });

    const matches = [];

    // 1라운드 (16강) - 8경기 생성 (16개 빈 슬롯)
    for (let i = 1; i <= 8; i++) {
      const match = await prisma.tournamentMatch.create({
        data: {
          tournamentId: tournament.id,
          round: 1,
          matchNumber: i,
          status: 'SCHEDULED'
        }
      });
      matches.push(match);
    }

    // 2라운드 (8강) - 4경기 생성
    for (let i = 1; i <= 4; i++) {
      const match = await prisma.tournamentMatch.create({
        data: {
          tournamentId: tournament.id,
          round: 2,
          matchNumber: i,
          status: 'SCHEDULED'
        }
      });
      matches.push(match);
    }

    // 3라운드 (4강) - 2경기 생성
    for (let i = 1; i <= 2; i++) {
      const match = await prisma.tournamentMatch.create({
        data: {
          tournamentId: tournament.id,
          round: 3,
          matchNumber: i,
          status: 'SCHEDULED'
        }
      });
      matches.push(match);
    }

    // 4라운드 (결승) - 1경기 생성
    const finalMatch = await prisma.tournamentMatch.create({
      data: {
        tournamentId: tournament.id,
        round: 4,
        matchNumber: 1,
        status: 'SCHEDULED'
      }
    });
    matches.push(finalMatch);

    return NextResponse.json({
      message: '16강 토너먼트 브래킷이 성공적으로 생성되었습니다. 각 경기에서 참가자 이름을 입력해주세요.',
      matches,
      totalMatches: matches.length,
      tournament
    });

  } catch (error) {
    console.error('Error creating tournament bracket:', error);
    return NextResponse.json({ error: 'Failed to create tournament bracket' }, { status: 500 });
  }
}
