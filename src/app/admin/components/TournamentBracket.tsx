'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  player1?: { id: string; name: string; department: string; seedNumber?: number };
  player2?: { id: string; name: string; department: string; seedNumber?: number };
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'BYE';
}

interface TournamentBracketProps {
  matches: Match[];
  users: any[];
  onGenerateBracket: () => Promise<void>;
  loading: boolean;
}

export default function TournamentBracket({ matches, users, onGenerateBracket, loading }: TournamentBracketProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerateBracket = async () => {
    const seededUsers = users.filter(user => user.seedNumber && !user.isBye);
    
    if (seededUsers.length < 2) {
      alert('브래킷을 생성하려면 최소 2명의 시드 배정된 참가자가 필요합니다.');
      return;
    }

    if (confirm(`${seededUsers.length}명의 시드 배정된 참가자로 토너먼트 브래킷을 생성하시겠습니까?\n기존 경기 데이터는 모두 삭제됩니다.`)) {
      try {
        setGenerating(true);
        await onGenerateBracket();
        alert('토너먼트 브래킷이 성공적으로 생성되었습니다!');
      } catch (error) {
        console.error('Error generating bracket:', error);
        alert('브래킷 생성 중 오류가 발생했습니다.');
      } finally {
        setGenerating(false);
      }
    }
  };

  const getMatchesByRound = (round: number) => {
    return matches.filter(match => match.round === round).sort((a, b) => a.matchNumber - b.matchNumber);
  };

  const getRoundName = (round: number) => {
    switch (round) {
      case 1: return '16강';
      case 2: return '8강';
      case 3: return '4강';
      case 4: return '결승';
      default: return `${round}라운드`;
    }
  };

  const PlayerCard = ({ player, score, isWinner, seedNumber }: { 
    player?: { name: string; department: string }; 
    score?: number; 
    isWinner?: boolean;
    seedNumber?: number;
  }) => (
    <div className={`p-2 border rounded text-sm ${
      isWinner ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'
    } ${!player ? 'bg-gray-50 border-gray-200' : ''}`}>
      {player ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {seedNumber && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                {seedNumber}
              </span>
            )}
            <div>
              <div className={`font-medium ${isWinner ? 'text-green-800' : 'text-gray-800'}`}>
                {player.name}
              </div>
              <div className="text-xs text-gray-500">{player.department}</div>
            </div>
          </div>
          {score !== undefined && (
            <div className={`font-bold ${isWinner ? 'text-green-600' : 'text-gray-600'}`}>
              {score}
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-center">대기중</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">토너먼트 대진표</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            시드 배정: {users.filter(u => u.seedNumber && !u.isBye).length}명
          </div>
          <button
            onClick={handleGenerateBracket}
            disabled={generating || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {generating ? '생성 중...' : '브래킷 생성'}
          </button>
        </div>
      </div>

      {matches.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 rounded-lg"
        >
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">토너먼트 브래킷</h3>
          <p className="text-gray-600 mb-4">
            참가자들에게 시드를 배정한 후 브래킷을 생성해주세요.
          </p>
          <button
            onClick={handleGenerateBracket}
            disabled={generating || users.filter(u => u.seedNumber && !u.isBye).length < 2}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {generating ? '생성 중...' : '브래킷 생성'}
          </button>
        </motion.div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="flex space-x-8">
              {[1, 2, 3, 4].map(round => {
                const roundMatches = getMatchesByRound(round);
                if (roundMatches.length === 0) return null;

                return (
                  <motion.div 
                    key={round}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: round * 0.1 }}
                    className="flex flex-col"
                  >
                    <h3 className="text-center font-semibold text-gray-800 mb-4 py-2 bg-gray-100 rounded">
                      {getRoundName(round)}
                    </h3>
                    <div className="space-y-4">
                      {roundMatches.map((match, index) => (
                        <motion.div 
                          key={match.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (round * 0.1) + (index * 0.05) }}
                          className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm min-w-[200px]"
                        >
                          <div className="text-xs text-gray-500 text-center mb-2">
                            경기 {match.matchNumber}
                          </div>
                          <div className="space-y-2">
                            <PlayerCard 
                              player={match.player1}
                              score={match.player1Score}
                              isWinner={match.winnerId === match.player1?.id}
                              seedNumber={match.player1?.seedNumber}
                            />
                            <div className="text-center text-xs text-gray-400">VS</div>
                            <PlayerCard 
                              player={match.player2}
                              score={match.player2Score}
                              isWinner={match.winnerId === match.player2?.id}
                              seedNumber={match.player2?.seedNumber}
                            />
                          </div>
                          <div className="mt-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              match.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              match.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                              match.status === 'BYE' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {match.status === 'COMPLETED' ? '완료' :
                               match.status === 'IN_PROGRESS' ? '진행중' :
                               match.status === 'BYE' ? '부전승' : '예정'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
