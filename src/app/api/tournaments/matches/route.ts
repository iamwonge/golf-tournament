import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// 모든 매치 조회 API
export async function GET() {
  try {
    console.log('Fetching matches from database...');
    const matches = await prisma.tournamentMatch.findMany({
      include: {
        tournament: true,
        player1: true,
        player2: true
      },
      orderBy: [
        { round: 'asc' },
        { matchNumber: 'asc' }
      ]
    });
    
    console.log(`Found ${matches.length} matches in database`);

    // 프론트엔드 형식에 맞게 변환
    const formattedMatches = matches.map(match => {
      // 디버깅을 위한 로그
      console.log('Match data:', {
        id: match.id,
        player1Name2: match.player1Name2,
        player1Name3: match.player1Name3,
        scheduledDate: match.scheduledDate
      });
      
      return {
        id: match.id,
        round: match.round,
        matchNumber: match.matchNumber,
        // 직접 입력된 이름이 우선, 없으면 User 테이블의 이름, 그것도 없으면 '대기중'
        player1Name: match.player1?.name || '대기중',
        player1Name2: match.player1Name2 || '',
        player1Name3: match.player1Name3 || '',
        player1Department: match.player1?.department || '대기중',
        player2Name: match.player2?.name || '대기중',
        player2Name2: match.player2Name2 || '',
        player2Name3: match.player2Name3 || '',
        player2Department: match.player2?.department || '대기중',
        player1Score: match.player1Score,
        player2Score: match.player2Score,
        winnerId: match.winnerId,
        status: match.status,
        scheduledDate: match.scheduledDate || ''
      };
    });

    return NextResponse.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

// 매치 생성/업데이트 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      matchId, 
      round, 
      matchNumber, 
      player1Name,
      player1Name2,
      player1Name3,
      player1Department, 
      player2Name,
      player2Name2,
      player2Name3,
      player2Department,
      player1Score,
      player2Score,
      winnerId,
      status,
      scheduledDate
    } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

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

    // 참가자들 생성 또는 찾기
    let player1Id = null;
    let player2Id = null;

    if (player1Name && player1Name !== '대기중') {
      try {
        const player1 = await prisma.user.upsert({
          where: { name: player1Name },
          update: { department: player1Department },
          create: { 
            name: player1Name, 
            department: player1Department 
          }
        });
        player1Id = player1.id;
      } catch {
        // 이미 존재하는 사용자 찾기
        const existingPlayer1 = await prisma.user.findUnique({
          where: { name: player1Name }
        });
        if (existingPlayer1) {
          player1Id = existingPlayer1.id;
        }
      }
    }

    if (player2Name && player2Name !== '대기중') {
      try {
        const player2 = await prisma.user.upsert({
          where: { name: player2Name },
          update: { department: player2Department },
          create: { 
            name: player2Name, 
            department: player2Department 
          }
        });
        player2Id = player2.id;
      } catch {
        // 이미 존재하는 사용자 찾기
        const existingPlayer2 = await prisma.user.findUnique({
          where: { name: player2Name }
        });
        if (existingPlayer2) {
          player2Id = existingPlayer2.id;
        }
      }
    }

    // 매치 생성 또는 업데이트
    const match = await prisma.tournamentMatch.upsert({
      where: { id: matchId },
      update: {
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        winnerId,
        status: status || 'SCHEDULED',
        player1Name2,
        player1Name3,
        player2Name2,
        player2Name3,
        scheduledDate
      },
      create: {
        id: matchId,
        tournamentId: departmentTournament.id,
        round: round || 1,
        matchNumber: matchNumber || 1,
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        winnerId,
        status: status || 'SCHEDULED',
        player1Name2,
        player1Name3,
        player2Name2,
        player2Name3,
        scheduledDate
      }
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error('Error creating/updating match:', error);
    return NextResponse.json({ error: 'Failed to create/update match' }, { status: 500 });
  }
}

// 경기 업데이트 API
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      matchId, 
      player1Name,
      player1Name2,
      player1Name3,
      player1Department, 
      player2Name,
      player2Name2,
      player2Name3,
      player2Department,
      player1Score,
      player2Score,
      winnerId,
      status,
      scheduledDate
    } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    // 참가자들 업데이트 또는 생성
    let player1Id = null;
    let player2Id = null;

    if (player1Name && player1Name !== '대기중') {
      try {
        const player1 = await prisma.user.upsert({
          where: { name: player1Name },
          update: { department: player1Department },
          create: { 
            name: player1Name, 
            department: player1Department 
          }
        });
        player1Id = player1.id;
      } catch {
        // 이미 존재하는 사용자 찾기
        const existingPlayer1 = await prisma.user.findUnique({
          where: { name: player1Name }
        });
        if (existingPlayer1) {
          player1Id = existingPlayer1.id;
        }
      }
    }

    if (player2Name && player2Name !== '대기중') {
      try {
        const player2 = await prisma.user.upsert({
          where: { name: player2Name },
          update: { department: player2Department },
          create: { 
            name: player2Name, 
            department: player2Department 
          }
        });
        player2Id = player2.id;
      } catch {
        // 이미 존재하는 사용자 찾기
        const existingPlayer2 = await prisma.user.findUnique({
          where: { name: player2Name }
        });
        if (existingPlayer2) {
          player2Id = existingPlayer2.id;
        }
      }
    }

    const updatedMatch = await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        winnerId,
        status: status || 'SCHEDULED',
        player1Name2,
        player1Name3,
        player2Name2,
        player2Name3,
        scheduledDate
      }
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}
