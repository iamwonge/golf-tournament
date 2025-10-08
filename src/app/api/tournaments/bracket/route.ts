import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 시드 기반 토너먼트 브래킷 생성
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
    const { tournamentId } = body;

    // 토너먼트 정보 조회
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // 시드 번호가 있는 참가자들 조회 (시드 순으로 정렬)
    const participants = await prisma.user.findMany({
      where: { 
        seedNumber: { not: null },
        isBye: false
      },
      orderBy: { seedNumber: 'asc' }
    });

    if (participants.length < 2) {
      return NextResponse.json({ error: '최소 2명의 시드 배정된 참가자가 필요합니다.' }, { status: 400 });
    }

    // 기존 경기 삭제
    await prisma.tournamentMatch.deleteMany({
      where: { tournamentId }
    });

    // 16강 대진표 생성 (1vs16, 2vs15, 3vs14, ...)
    const matches = [];
    const maxParticipants = Math.min(participants.length, 16);
    
    // 1라운드 (16강) 매치 생성
    for (let i = 0; i < maxParticipants / 2; i++) {
      const player1 = participants[i];
      const player2Index = maxParticipants - 1 - i;
      const player2 = participants[player2Index] || null;

      const match = await prisma.tournamentMatch.create({
        data: {
          tournamentId,
          round: 1,
          matchNumber: i + 1,
          player1Id: player1.id,
          player2Id: player2?.id || null,
          status: player2 ? 'SCHEDULED' : 'BYE'
        },
        include: {
          player1: true,
          player2: true
        }
      });

      matches.push(match);

      // 부전승 처리
      if (!player2) {
        await prisma.tournamentMatch.update({
          where: { id: match.id },
          data: {
            winnerId: player1.id,
            status: 'COMPLETED'
          }
        });
      }
    }

    // 상위 라운드 빈 매치 생성 (8강, 4강, 결승)
    const rounds = [
      { round: 2, matchCount: Math.ceil(maxParticipants / 4) }, // 8강
      { round: 3, matchCount: Math.ceil(maxParticipants / 8) }, // 4강
      { round: 4, matchCount: 1 } // 결승
    ];

    for (const { round, matchCount } of rounds) {
      for (let i = 0; i < matchCount; i++) {
        const match = await prisma.tournamentMatch.create({
          data: {
            tournamentId,
            round,
            matchNumber: i + 1,
            status: 'SCHEDULED'
          }
        });
        matches.push(match);
      }
    }

    return NextResponse.json({
      message: '토너먼트 브래킷이 성공적으로 생성되었습니다.',
      matches,
      participantCount: participants.length
    });

  } catch (error) {
    console.error('Error creating tournament bracket:', error);
    return NextResponse.json({ error: 'Failed to create tournament bracket' }, { status: 500 });
  }
}
