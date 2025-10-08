// 골프 대회 데이터 스토어
export interface User {
  id: string;
  name: string;
  department: string;
  phone?: string;
  email?: string;
  position?: string; // 경영진, 팀장급, 팀원급
}

export interface Tournament {
  id: string;
  name: string;
  type: 'DEPARTMENT' | 'EXECUTIVE';
  maxPlayers: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  participants: string[]; // User IDs
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  player1Score?: number;
  player2Score?: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'BYE';
}

export interface Record {
  id: string;
  userId: string;
  distance: number;
  accuracy?: number;
  createdAt: string;
  type: 'LONGEST' | 'PUTTING' | 'NEAREST';
}

export interface Team {
  id: string;
  name: string;
  executiveId?: string; // 경영진
  managerId?: string;   // 팀장급
  memberId?: string;    // 팀원급
}

// 로컬 스토리지 키
const STORAGE_KEYS = {
  USERS: 'golf_tournament_users',
  TOURNAMENTS: 'golf_tournament_tournaments',
  MATCHES: 'golf_tournament_matches',
  RECORDS: 'golf_tournament_records',
  TEAMS: 'golf_tournament_teams'
};

// 데이터 스토어 클래스
class GolfTournamentStore {
  private users: User[] = [];
  private tournaments: Tournament[] = [];
  private matches: Match[] = [];
  private records: Record[] = [];
  private teams: Team[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultData();
  }

  // 이벤트 리스너 관리
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // 로컬 스토리지에서 데이터 로드
  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      this.users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      this.tournaments = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOURNAMENTS) || '[]');
      this.matches = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES) || '[]');
      this.records = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || '[]');
      this.teams = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
    } catch (error) {
      console.error('Failed to load data from storage:', error);
    }
  }

  // 로컬 스토리지에 데이터 저장
  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(this.tournaments));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(this.matches));
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(this.records));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(this.teams));
    } catch (error) {
      console.error('Failed to save data to storage:', error);
    }
  }

  // 초기 데이터 설정
  private initializeDefaultData() {
    if (this.users.length === 0) {
      this.users = [
        { id: '1', name: '김철수', department: '영업본부', phone: '010-1234-5678', email: 'kim@company.com' },
        { id: '2', name: '이영희', department: '기술본부', phone: '010-2345-6789', email: 'lee@company.com' },
        { id: '3', name: '박민수', department: '마케팅본부', phone: '010-3456-7890', email: 'park@company.com' },
        { id: '4', name: '정수진', department: '인사본부', phone: '010-4567-8901', email: 'jung@company.com' }
      ];
    }

    if (this.tournaments.length === 0) {
      this.tournaments = [
        { 
          id: '1', 
          name: '본부별 토너먼트', 
          type: 'DEPARTMENT', 
          maxPlayers: 16, 
          status: 'IN_PROGRESS', 
          startDate: '2025-10-04',
          participants: ['1', '2', '3', '4']
        },
        { 
          id: '2', 
          name: '경영진 토너먼트', 
          type: 'EXECUTIVE', 
          maxPlayers: 4, 
          status: 'UPCOMING', 
          startDate: '2025-10-05',
          participants: []
        }
      ];
    }

    if (this.matches.length === 0) {
      this.matches = [
        // 16강 (1라운드) - 8경기
        {
          id: '1',
          tournamentId: '1',
          round: 1,
          matchNumber: 1,
          player1Id: '1',
          player2Id: '2',
          winnerId: '1',
          player1Score: 3,
          player2Score: 2,
          status: 'COMPLETED'
        },
        {
          id: '2',
          tournamentId: '1',
          round: 1,
          matchNumber: 2,
          player1Id: '3',
          player2Id: '4',
          status: 'SCHEDULED'
        },
        {
          id: '3',
          tournamentId: '1',
          round: 1,
          matchNumber: 3,
          status: 'SCHEDULED'
        },
        {
          id: '4',
          tournamentId: '1',
          round: 1,
          matchNumber: 4,
          status: 'SCHEDULED'
        },
        {
          id: '5',
          tournamentId: '1',
          round: 1,
          matchNumber: 5,
          status: 'SCHEDULED'
        },
        {
          id: '6',
          tournamentId: '1',
          round: 1,
          matchNumber: 6,
          status: 'SCHEDULED'
        },
        {
          id: '7',
          tournamentId: '1',
          round: 1,
          matchNumber: 7,
          status: 'SCHEDULED'
        },
        {
          id: '8',
          tournamentId: '1',
          round: 1,
          matchNumber: 8,
          status: 'SCHEDULED'
        },
        
        // 8강 (2라운드) - 4경기
        {
          id: '9',
          tournamentId: '1',
          round: 2,
          matchNumber: 1,
          status: 'SCHEDULED'
        },
        {
          id: '10',
          tournamentId: '1',
          round: 2,
          matchNumber: 2,
          status: 'SCHEDULED'
        },
        {
          id: '11',
          tournamentId: '1',
          round: 2,
          matchNumber: 3,
          status: 'SCHEDULED'
        },
        {
          id: '12',
          tournamentId: '1',
          round: 2,
          matchNumber: 4,
          status: 'SCHEDULED'
        },
        
        // 4강 (3라운드) - 2경기
        {
          id: '13',
          tournamentId: '1',
          round: 3,
          matchNumber: 1,
          status: 'SCHEDULED'
        },
        {
          id: '14',
          tournamentId: '1',
          round: 3,
          matchNumber: 2,
          status: 'SCHEDULED'
        },
        
        // 결승 (4라운드) - 1경기
        {
          id: '15',
          tournamentId: '1',
          round: 4,
          matchNumber: 1,
          status: 'SCHEDULED'
        }
      ];
    }

    if (this.records.length === 0) {
      this.records = [
        { id: '1', userId: '1', distance: 285.5, type: 'LONGEST', createdAt: '2025-10-04' },
        { id: '2', userId: '2', distance: 19.72, accuracy: 0.02, type: 'PUTTING', createdAt: '2025-10-04' },
        { id: '3', userId: '3', distance: 50.8, accuracy: 0.2, type: 'NEAREST', createdAt: '2025-10-04' }
      ];
    }

    this.saveToStorage();
  }

  // Users 관리
  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString()
    };
    this.users.push(newUser);
    this.saveToStorage();
    this.notify();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    this.users[index] = { ...this.users[index], ...updates };
    this.saveToStorage();
    this.notify();
    return true;
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    this.saveToStorage();
    this.notify();
    return true;
  }

  // Tournaments 관리
  getTournaments(): Tournament[] {
    return [...this.tournaments];
  }

  getTournamentById(id: string): Tournament | undefined {
    return this.tournaments.find(tournament => tournament.id === id);
  }

  // 대회별 참가자 관리
  addParticipantToTournament(tournamentId: string, userId: string): boolean {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return false;
    
    if (!tournament.participants.includes(userId)) {
      tournament.participants.push(userId);
      this.saveToStorage();
      this.notify();
    }
    return true;
  }

  removeParticipantFromTournament(tournamentId: string, userId: string): boolean {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return false;
    
    const index = tournament.participants.indexOf(userId);
    if (index > -1) {
      tournament.participants.splice(index, 1);
      this.saveToStorage();
      this.notify();
    }
    return true;
  }

  getTournamentParticipants(tournamentId: string): User[] {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return [];
    
    return tournament.participants
      .map(userId => this.getUserById(userId))
      .filter(user => user !== undefined) as User[];
  }

  // Matches 관리
  getMatches(): Match[] {
    return [...this.matches];
  }

  getMatchesByTournament(tournamentId: string): Match[] {
    return this.matches.filter(match => match.tournamentId === tournamentId);
  }

  addMatch(match: Omit<Match, 'id'>): Match {
    const newMatch: Match = {
      ...match,
      id: Date.now().toString()
    };
    this.matches.push(newMatch);
    this.saveToStorage();
    this.notify();
    return newMatch;
  }

  updateMatch(id: string, updates: Partial<Match>): boolean {
    const index = this.matches.findIndex(match => match.id === id);
    if (index === -1) return false;
    
    const oldMatch = this.matches[index];
    this.matches[index] = { ...oldMatch, ...updates };
    
    // 경기가 완료되고 승자가 결정된 경우, 다음 라운드 진출 처리
    if (updates.status === 'COMPLETED' && updates.winnerId && !oldMatch.winnerId) {
      this.advanceWinnerToNextRound(this.matches[index]);
    }
    
    this.saveToStorage();
    this.notify();
    return true;
  }

  // 승자를 다음 라운드로 진출시키는 함수
  private advanceWinnerToNextRound(completedMatch: Match): void {
    const { tournamentId, round, matchNumber, winnerId } = completedMatch;
    
    console.log(`🏆 자동 진출 처리 시작:`, {
      tournamentId,
      round,
      matchNumber,
      winnerId,
      winnerName: this.getUserById(winnerId || '')?.name
    });
    
    if (!winnerId) {
      console.log('❌ 승자 ID가 없어서 진출 처리를 중단합니다.');
      return;
    }
    
    // 다음 라운드 번호 계산
    const nextRound = round + 1;
    
    // 결승 이후는 없음
    if (nextRound > 4) {
      console.log('🏁 결승 이후라서 진출 처리를 중단합니다.');
      return;
    }
    
    // 다음 라운드에서의 경기 번호 계산 (현재 경기 번호를 2로 나눈 올림값)
    const nextMatchNumber = Math.ceil(matchNumber / 2);
    
    console.log(`📍 다음 라운드 정보: Round ${nextRound}, Match ${nextMatchNumber}`);
    
    // 다음 라운드 경기 찾기
    const nextMatch = this.matches.find(m => 
      m.tournamentId === tournamentId && 
      m.round === nextRound && 
      m.matchNumber === nextMatchNumber
    );
    
    if (!nextMatch) {
      console.error(`❌ 다음 라운드 경기를 찾을 수 없습니다: Tournament ${tournamentId}, Round ${nextRound}, Match ${nextMatchNumber}`);
      console.log('현재 매치 목록:', this.matches.filter(m => m.tournamentId === tournamentId));
      return;
    }
    
    console.log(`✅ 다음 라운드 경기 발견:`, nextMatch);
    
    // 승자를 다음 라운드 경기에 배치
    // 홀수 번째 경기의 승자는 player1, 짝수 번째 경기의 승자는 player2
    if (matchNumber % 2 === 1) {
      nextMatch.player1Id = winnerId;
      console.log(`👤 승자를 Player1로 배치: ${this.getUserById(winnerId)?.name}`);
    } else {
      nextMatch.player2Id = winnerId;
      console.log(`👤 승자를 Player2로 배치: ${this.getUserById(winnerId)?.name}`);
    }
    
    // 다음 라운드 경기 업데이트
    const nextMatchIndex = this.matches.findIndex(m => m.id === nextMatch.id);
    if (nextMatchIndex !== -1) {
      this.matches[nextMatchIndex] = nextMatch;
      console.log(`✅ 다음 라운드 경기 업데이트 완료:`, this.matches[nextMatchIndex]);
    } else {
      console.error('❌ 다음 라운드 경기 인덱스를 찾을 수 없습니다.');
    }
  }

  deleteMatch(id: string): boolean {
    const index = this.matches.findIndex(match => match.id === id);
    if (index === -1) return false;
    
    this.matches.splice(index, 1);
    this.saveToStorage();
    this.notify();
    return true;
  }

  // 완전한 토너먼트 구조 생성 (16강 토너먼트용)
  generateCompleteTournamentStructure(tournamentId: string): boolean {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return false;

    // 기존 경기 삭제 (브래킷 재생성)
    this.matches = this.matches.filter(m => m.tournamentId !== tournamentId);

    // 완전한 토너먼트 구조 생성 (16강 기준)
    const tournamentStructure = [
      { round: 1, matchCount: 8 },  // 16강 -> 8경기
      { round: 2, matchCount: 4 },  // 8강 -> 4경기
      { round: 3, matchCount: 2 },  // 4강 -> 2경기
      { round: 4, matchCount: 1 }   // 결승 -> 1경기
    ];

    // 모든 라운드의 빈 매치 슬롯 생성
    tournamentStructure.forEach(({ round, matchCount }) => {
      for (let matchNumber = 1; matchNumber <= matchCount; matchNumber++) {
        const newMatch: Match = {
          id: `${tournamentId}_r${round}_m${matchNumber}`,
          tournamentId,
          round,
          matchNumber,
          status: 'SCHEDULED'
        };
        this.matches.push(newMatch);
      }
    });

    this.saveToStorage();
    this.notify();
    return true;
  }

  // 토너먼트 브래킷 생성 함수 (참가자 배치)
  generateTournamentBracket(tournamentId: string): boolean {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return false;

    const participants = tournament.participants;
    if (participants.length === 0) return false;

    // 먼저 완전한 토너먼트 구조 생성
    this.generateCompleteTournamentStructure(tournamentId);

    // 1라운드 경기에 참가자 배치
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    const firstRoundMatches = this.matches.filter(m => 
      m.tournamentId === tournamentId && m.round === 1
    ).sort((a, b) => a.matchNumber - b.matchNumber);

    let participantIndex = 0;
    firstRoundMatches.forEach((match, index) => {
      if (participantIndex < shuffledParticipants.length) {
        match.player1Id = shuffledParticipants[participantIndex++];
        
        if (participantIndex < shuffledParticipants.length) {
          match.player2Id = shuffledParticipants[participantIndex++];
        } else {
          // 홀수 명인 경우 부전승
          match.winnerId = match.player1Id;
          match.status = 'BYE';
          // 부전승자를 다음 라운드로 자동 진출
          this.advanceWinnerToNextRound(match);
        }
      }
    });

    this.saveToStorage();
    this.notify();
    return true;
  }

  // Records 관리
  getRecords(): Record[] {
    return [...this.records];
  }

  getRecordsByType(type: Record['type']): Record[] {
    return this.records.filter(record => record.type === type);
  }

  addRecord(record: Omit<Record, 'id' | 'createdAt'>): Record {
    const newRecord: Record = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.records.push(newRecord);
    this.saveToStorage();
    this.notify();
    return newRecord;
  }

  updateRecord(id: string, updates: Partial<Record>): boolean {
    const index = this.records.findIndex(record => record.id === id);
    if (index === -1) return false;
    
    this.records[index] = { ...this.records[index], ...updates };
    this.saveToStorage();
    this.notify();
    return true;
  }

  deleteRecord(id: string): boolean {
    const index = this.records.findIndex(record => record.id === id);
    if (index === -1) return false;
    
    this.records.splice(index, 1);
    this.saveToStorage();
    this.notify();
    return true;
  }

  // Teams 관리
  getTeams(): Team[] {
    return [...this.teams];
  }

  addTeam(team: Omit<Team, 'id'>): Team {
    const newTeam: Team = {
      ...team,
      id: Date.now().toString()
    };
    this.teams.push(newTeam);
    this.saveToStorage();
    this.notify();
    return newTeam;
  }

  // 데이터 초기화
  clearAllData(): void {
    this.users = [];
    this.tournaments = [];
    this.matches = [];
    this.records = [];
    this.teams = [];
    
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
    
    this.initializeDefaultData();
    this.notify();
  }
}

// 싱글톤 인스턴스
export const golfStore = new GolfTournamentStore();

// React Hook
import { useState, useEffect } from 'react';

export function useGolfStore() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = golfStore.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  return {
    // Users
    users: golfStore.getUsers(),
    getUserById: golfStore.getUserById.bind(golfStore),
    addUser: golfStore.addUser.bind(golfStore),
    updateUser: golfStore.updateUser.bind(golfStore),
    deleteUser: golfStore.deleteUser.bind(golfStore),

    // Tournaments
    tournaments: golfStore.getTournaments(),
    getTournamentById: golfStore.getTournamentById.bind(golfStore),
    addParticipantToTournament: golfStore.addParticipantToTournament.bind(golfStore),
    removeParticipantFromTournament: golfStore.removeParticipantFromTournament.bind(golfStore),
    getTournamentParticipants: golfStore.getTournamentParticipants.bind(golfStore),

    // Matches
    matches: golfStore.getMatches(),
    getMatchesByTournament: golfStore.getMatchesByTournament.bind(golfStore),
    addMatch: golfStore.addMatch.bind(golfStore),
    updateMatch: golfStore.updateMatch.bind(golfStore),
    deleteMatch: golfStore.deleteMatch.bind(golfStore),
    generateTournamentBracket: golfStore.generateTournamentBracket.bind(golfStore),
    generateCompleteTournamentStructure: golfStore.generateCompleteTournamentStructure.bind(golfStore),

    // Records
    records: golfStore.getRecords(),
    getRecordsByType: golfStore.getRecordsByType.bind(golfStore),
    addRecord: golfStore.addRecord.bind(golfStore),
    updateRecord: golfStore.updateRecord.bind(golfStore),
    deleteRecord: golfStore.deleteRecord.bind(golfStore),

    // Teams
    teams: golfStore.getTeams(),
    addTeam: golfStore.addTeam.bind(golfStore),

    // Utility
    clearAllData: golfStore.clearAllData.bind(golfStore)
  };
}
