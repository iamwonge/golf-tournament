'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  player1Name: string;
  player1Department: string;
  player2Name: string;
  player2Department: string;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'BYE';
}

export default function DepartmentTournamentPage() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    // 데이터베이스에서 토너먼트 매치 데이터 로드
    const loadMatches = async () => {
      try {
        const response = await fetch('/api/tournaments/matches');
        if (response.ok) {
          const data = await response.json();
          setMatches(data);
          return;
        }
      } catch (error) {
        console.error('Failed to load matches from database:', error);
      }
      
      // 데이터베이스 실패 시 로컬스토리지에서 로드
      const savedMatches = localStorage.getItem('department_tournament_matches');
      if (savedMatches) {
        setMatches(JSON.parse(savedMatches));
      }
    };

    loadMatches();
  }, []);

  const getMatchesByRound = (round: number) => {
    return matches.filter(match => match.round === round).sort((a, b) => a.matchNumber - b.matchNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BYE': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '완료';
      case 'IN_PROGRESS': return '진행중';
      case 'BYE': return '부전승';
      default: return '진행예정';
    }
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          🏆 본부별 토너먼트 (16강)
        </h1>
        <p className="text-gray-600">각 본부 대표들의 치열한 경쟁!</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">13</div>
          <div className="text-sm text-gray-600">총 참가팀</div>
        </div>
        <div className="bg-white dark:bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {matches.filter(m => m.status === 'COMPLETED' || m.status === 'BYE').length}
          </div>
          <div className="text-sm text-gray-600">완료된 경기</div>
        </div>
        <div className="bg-white dark:bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {matches.filter(m => m.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-sm text-gray-600">진행중 경기</div>
        </div>
        <div className="bg-white dark:bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {matches.filter(m => m.status === 'SCHEDULED').length}
          </div>
          <div className="text-sm text-gray-600">예정된 경기</div>
        </div>
      </div>

      {/* 토너먼트 브래킷 - 피라미드 형식 */}
      <div className="bg-white dark:bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">토너먼트 브래킷</h2>
        
        <div className="space-y-8">
          {/* 결승 - 맨 위 */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <h3 className="text-2xl font-bold text-center mb-6 text-red-600">🏆 결승</h3>
              {getMatchesByRound(4).map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4 + index * 0.1 }}
                  className={`border-2 rounded-lg p-4 ${getStatusColor(match.status)} bg-gradient-to-r from-yellow-50 to-red-50`}
                >
                  <div className="text-xs font-semibold mb-3 text-center">
                    🏆 {getStatusText(match.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`flex justify-between items-center p-3 rounded ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div>
                        <div className="font-medium">{match.player1Name}</div>
                        <div className="text-xs text-gray-600">{match.player1Department}</div>
                      </div>
                      {match.player1Score !== undefined && (
                        <div className="font-bold">{match.player1Score}</div>
                      )}
                    </div>
                    
                    <div className="text-center text-xs text-gray-500 font-semibold">VS</div>
                    
                    <div className={`flex justify-between items-center p-3 rounded ${match.winnerId === 'player2' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div>
                        <div className="font-medium">{match.player2Name}</div>
                        <div className="text-xs text-gray-600">{match.player2Department}</div>
                      </div>
                      {match.player2Score !== undefined && (
                        <div className="font-bold">{match.player2Score}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 4강 */}
          <div className="flex justify-center">
            <div className="w-full max-w-6xl">
              <h3 className="text-2xl font-bold mb-6 text-orange-600 text-center">4강</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {getMatchesByRound(3).map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 + index * 0.1 }}
                    className={`border-2 rounded-lg p-4 ${getStatusColor(match.status)}`}
                  >
                    <div className="text-xs font-semibold mb-3 text-center">
                      {getStatusText(match.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`flex justify-between items-center p-3 rounded ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div>
                          <div className="font-medium">{match.player1Name}</div>
                          <div className="text-xs text-gray-600">{match.player1Department}</div>
                        </div>
                        {match.player1Score !== undefined && (
                          <div className="font-bold">{match.player1Score}</div>
                        )}
                      </div>
                      
                      <div className="text-center text-xs text-gray-500 font-semibold">VS</div>
                      
                      <div className={`flex justify-between items-center p-3 rounded ${match.winnerId === 'player2' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div>
                          <div className="font-medium">{match.player2Name}</div>
                          <div className="text-xs text-gray-600">{match.player2Department}</div>
                        </div>
                        {match.player2Score !== undefined && (
                          <div className="font-bold">{match.player2Score}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* 8강 */}
          <div className="flex justify-center">
            <div className="w-full">
              <h3 className="text-2xl font-bold mb-6 text-green-600 text-center">8강</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getMatchesByRound(2).map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`border-2 rounded-lg p-3 ${getStatusColor(match.status)}`}
                  >
                    <div className="text-xs font-semibold mb-2 text-center">
                      {getStatusText(match.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`flex justify-between items-center p-2 rounded text-sm ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div>
                          <div className="font-medium">{match.player1Name}</div>
                          <div className="text-xs text-gray-600">{match.player1Department}</div>
                        </div>
                        {match.player1Score !== undefined && (
                          <div className="font-bold">{match.player1Score}</div>
                        )}
                      </div>
                      
                      <div className="text-center text-xs text-gray-500 font-semibold">VS</div>
                      
                      <div className={`flex justify-between items-center p-2 rounded text-sm ${match.winnerId === 'player2' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div>
                          <div className="font-medium">{match.player2Name}</div>
                          <div className="text-xs text-gray-600">{match.player2Department}</div>
                        </div>
                        {match.player2Score !== undefined && (
                          <div className="font-bold">{match.player2Score}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* 16강 - 맨 아래 */}
          <div className="flex justify-center">
            <div className="w-full">
              <h3 className="text-2xl font-bold text-center mb-6 text-blue-600">16강</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                {getMatchesByRound(1).map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-2 rounded-lg p-2 ${getStatusColor(match.status)}`}
                  >
                    <div className="text-xs font-semibold mb-2 text-center">
                      {getStatusText(match.status)}
                    </div>
                    
                    {match.status === 'BYE' ? (
                      <div className="text-center">
                        <div className="font-medium text-sm">{match.player1Name}</div>
                        <div className="text-xs text-gray-600">{match.player1Department}</div>
                        <div className="text-xs font-semibold text-blue-600 mt-1">부전승</div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className={`p-1 rounded text-xs ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <div className="font-medium">{match.player1Name}</div>
                          <div className="text-xs text-gray-600 truncate">{match.player1Department}</div>
                          {match.player1Score !== undefined && (
                            <div className="font-bold text-center">{match.player1Score}</div>
                          )}
                        </div>
                        
                        <div className="text-center text-xs text-gray-500">VS</div>
                        
                        <div className={`p-1 rounded text-xs ${match.winnerId === 'player2' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <div className="font-medium">{match.player2Name}</div>
                          <div className="text-xs text-gray-600 truncate">{match.player2Department}</div>
                          {match.player2Score !== undefined && (
                            <div className="font-bold text-center">{match.player2Score}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 경기 결과 테이블 */}
      <div className="bg-white dark:bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">경기 결과</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">라운드</th>
                <th className="text-left py-3 px-4">경기</th>
                <th className="text-left py-3 px-4">참가자 1</th>
                <th className="text-center py-3 px-4">점수</th>
                <th className="text-left py-3 px-4">참가자 2</th>
                <th className="text-center py-3 px-4">상태</th>
              </tr>
            </thead>
            <tbody>
              {matches.filter(m => m.status === 'COMPLETED').map((match) => (
                <tr key={match.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {match.round === 1 ? '16강' : match.round === 2 ? '8강' : match.round === 3 ? '4강' : '결승'}
                  </td>
                  <td className="py-3 px-4">{match.matchNumber}경기</td>
                  <td className="py-3 px-4">
                    <div className={match.winnerId === 'player1' ? 'font-bold text-green-600' : ''}>
                      {match.player1Name}
                      <div className="text-sm text-gray-600">{match.player1Department}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {match.player1Score} - {match.player2Score}
                  </td>
                  <td className="py-3 px-4">
                    <div className={match.winnerId === 'player2' ? 'font-bold text-green-600' : ''}>
                      {match.player2Name}
                      <div className="text-sm text-gray-600">{match.player2Department}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(match.status)}`}>
                      {getStatusText(match.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}