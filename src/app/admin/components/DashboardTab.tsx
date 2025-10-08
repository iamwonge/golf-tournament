'use client';

import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  department: string;
  phone?: string;
  email?: string;
}

interface Tournament {
  id: string;
  name: string;
  type: string;
  status: string;
  matches?: Match[];
}

interface Match {
  id: string;
  player1?: User;
  player2?: User;
  winnerId?: string;
  status: string;
}

interface Record {
  id: string;
  playerName: string;
  department: string;
  distance?: number;
  accuracy?: number;
}

interface DashboardTabProps {
  users: User[];
  tournaments: Tournament[];
  records: Record[];
}

export default function DashboardTab({ users, tournaments, records }: DashboardTabProps) {
  const getTournamentParticipants = (_tournamentId: string) => {
    return users; // 임시로 모든 사용자 반환
  };

  const getMatchesWithUsers = (tournamentId?: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    return tournament?.matches || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">전체 대회 현황</h2>
      </div>

      {/* 대회별 현황 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">본부별 토너먼트</h3>
              <p className="text-blue-600">16강 토너먼트</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">참가자:</span>
              <span className="font-semibold text-blue-800">{getTournamentParticipants('1').length}명</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">완료 경기:</span>
              <span className="font-semibold text-blue-800">{getMatchesWithUsers('1').filter((m: Match) => m.status === 'COMPLETED').length}경기</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-800">경영진 매치</h3>
              <p className="text-purple-600">4강 대항전</p>
            </div>
            <div className="text-3xl">👑</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">참가자:</span>
              <span className="font-semibold text-purple-800">{getTournamentParticipants('2').length}명</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">진행률:</span>
              <span className="font-semibold text-purple-800">25%</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">개인전 종목</h3>
              <p className="text-green-600">롱기스트/퍼팅/니어핀</p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">총 기록:</span>
              <span className="font-semibold text-green-800">{records.length}개</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">참가자:</span>
              <span className="font-semibold text-green-800">{new Set(records.map(r => `${r.playerName}-${r.department}`)).size}명</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 최근 활동 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 rounded-lg p-6"
      >
        <h3 className="text-lg font-medium text-gray-800 mb-4">최근 활동</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">김철수님이 롱기스트 드라이브에서 285.5m 기록</span>
            <span className="text-gray-400">2분 전</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">본부별 토너먼트 1라운드 경기 완료</span>
            <span className="text-gray-400">15분 전</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">새로운 참가자 등록: 정수진 (인사본부)</span>
            <span className="text-gray-400">1시간 전</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
