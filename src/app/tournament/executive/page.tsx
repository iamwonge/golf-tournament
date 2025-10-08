'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ExecutiveMatch {
  id: string;
  round: number;
  matchNumber: number;
  teamName: string;
  executiveName: string; // 경영진
  managerName: string;   // 팀장급
  memberName: string;    // 팀원급
  score?: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function ExecutiveTournamentPage() {
  const [matches, setMatches] = useState<ExecutiveMatch[]>([]);

  useEffect(() => {
    // 데이터베이스에서 경영진 팀 데이터 로드
    const loadMatches = async () => {
      try {
        const response = await fetch('/api/executive-teams');
        if (response.ok) {
          const teams = await response.json();
          // API 데이터를 ExecutiveMatch 형식으로 변환
          const formattedMatches: ExecutiveMatch[] = teams.map((team: any, index: number) => ({
            id: team.id,
            round: 1,
            matchNumber: index + 1,
            teamName: team.teamName,
            executiveName: team.executiveName,
            managerName: team.managerName,
            memberName: team.memberName,
            score: team.score,
            status: team.status
          }));
          
          setMatches(formattedMatches);
        } else {
          console.error('Failed to load executive teams');
        }
      } catch (error) {
        console.error('Error loading executive teams:', error);
      }
      
      // 데이터가 없으면 기본 팀 표시
      if (matches.length === 0) {
        const defaultTeams: ExecutiveMatch[] = [
          { id: '1', round: 1, matchNumber: 1, teamName: 'A팀', executiveName: '김대표', managerName: '이팀장', memberName: '박사원', status: 'SCHEDULED' },
          { id: '2', round: 1, matchNumber: 2, teamName: 'B팀', executiveName: '이부사장', managerName: '정팀장', memberName: '최사원', status: 'SCHEDULED' },
          { id: '3', round: 1, matchNumber: 3, teamName: 'C팀', executiveName: '박전무', managerName: '김팀장', memberName: '조사원', status: 'SCHEDULED' },
          { id: '4', round: 1, matchNumber: 4, teamName: 'D팀', executiveName: '정상무', managerName: '윤팀장', memberName: '한사원', status: 'SCHEDULED' }
        ];
        setMatches(defaultTeams);
      }
    };

    loadMatches();
    
    // 5초마다 데이터 새로고침 (실시간 연동)
    const interval = setInterval(loadMatches, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '완료';
      case 'IN_PROGRESS': return '진행중';
      default: return '예정';
    }
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">
          👑 경영진 매치게임
        </h1>
        <p className="text-gray-600">회사 경영진들의 프리미엄 골프 매치!</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">4</div>
          <div className="text-sm text-gray-600">총 참가팀</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
          <div className="text-sm text-gray-600">총 매치</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {matches.filter(m => m.status === 'COMPLETED').length}
          </div>
          <div className="text-sm text-gray-600">완료된 매치</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {matches.filter(m => m.status === 'SCHEDULED').length}
          </div>
          <div className="text-sm text-gray-600">예정된 매치</div>
        </div>
      </div>

      {/* 참가팀 소개 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">참가팀 소개</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors"
            >
              <div className="text-4xl mb-2">👔</div>
              <div className="font-bold text-lg text-gray-800 mb-2">{match.teamName}</div>
              <div className="space-y-1">
                <div className="text-sm text-red-600 font-semibold">{match.executiveName}</div>
                <div className="text-sm text-blue-600">{match.managerName}</div>
                <div className="text-sm text-green-600">{match.memberName}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 우승 카드 */}
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-100 rounded-2xl shadow-xl p-8 border-4 border-yellow-300 max-w-md w-full"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">👑</div>
            <h3 className="text-2xl font-bold text-yellow-800 mb-2">우승</h3>
            {(() => {
              // 가장 낮은 점수를 가진 팀 찾기 (골프는 낮은 점수가 좋음)
              const completedMatches = matches.filter(m => m.status === 'COMPLETED' && m.score !== undefined);
              
              if (completedMatches.length > 0) {
                const bestTeam = completedMatches.reduce((best, current) => {
                  return (current.score! < best.score!) ? current : best;
                });
                
                return (
                  <div>
                    <div className="text-3xl font-bold text-yellow-900 mb-2">{bestTeam.teamName}</div>
                    <div className="text-lg text-yellow-800 mb-1">{bestTeam.executiveName}</div>
                    <div className="text-sm text-yellow-700 mb-1">{bestTeam.managerName}</div>
                    <div className="text-sm text-yellow-700 mb-3">{bestTeam.memberName}</div>
                    <div className="text-lg text-yellow-700">
                      최고 스코어: {bestTeam.score}타
                    </div>
                  </div>
                );
              } else {
                return (
                  <div>
                    <div className="text-xl text-yellow-700">경기전</div>
                    <div className="text-sm text-yellow-600">경기 결과를 기다리고 있습니다</div>
                  </div>
                );
              }
            })()}
          </div>
        </motion.div>
      </div>

      {/* 최종 점수 결과 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">최종 점수</h2>
        
        {/* 4개 팀의 최종 점수 - 4x1 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {matches
            .sort((a, b) => (a.score || 999) - (b.score || 999)) // 낮은 점수 순으로 정렬
            .map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border-2 rounded-xl p-6 ${index === 0 && match.status === 'COMPLETED' ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'} shadow-lg text-center`}
            >
              {index === 0 && match.status === 'COMPLETED' && (
                <div className="text-3xl mb-2">🏆</div>
              )}
              
              <div className="text-4xl mb-2">👔</div>
              
              <div className="mb-3">
                <div className="font-bold text-lg text-gray-800 mb-2">{match.teamName}</div>
                <div className="text-sm text-red-600 font-semibold">{match.executiveName}</div>
                <div className="text-sm text-blue-600">{match.managerName}</div>
                <div className="text-sm text-green-600">{match.memberName}</div>
              </div>
              
              <div className="text-center">
                {match.score !== undefined ? (
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {match.score}
                  </div>
                ) : (
                  <div className="text-xl text-gray-400 mb-1">경기전</div>
                )}
                <div className="text-sm text-gray-600">타수</div>
              </div>
              
              {index === 0 && match.status === 'COMPLETED' && (
                <div className="mt-3 text-sm font-semibold text-yellow-700">
                  🥇 1위
                </div>
              )}
              
              {match.status !== 'COMPLETED' && (
                <div className="mt-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(match.status)}`}>
                    {getStatusText(match.status)}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 순위표 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">순위표</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center py-3 px-4">순위</th>
                <th className="text-left py-3 px-4">참가팀</th>
                <th className="text-center py-3 px-4">최종 스코어</th>
                <th className="text-center py-3 px-4">상태</th>
              </tr>
            </thead>
            <tbody>
              {matches
                .sort((a, b) => (a.score || 999) - (b.score || 999))
                .map((match, index) => (
                <tr key={match.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {index === 0 && match.status === 'COMPLETED' && <span className="text-lg">🏆</span>}
                      <span className="font-bold text-lg">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">👔</span>
                      <div>
                        <div className="font-medium">{match.teamName}</div>
                        <div className="text-xs text-red-600">{match.executiveName}</div>
                        <div className="text-xs text-blue-600">{match.managerName}</div>
                        <div className="text-xs text-green-600">{match.memberName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-lg">
                    {match.score !== undefined 
                      ? `${match.score}타` 
                      : '경기전'
                    }
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(match.status)}`}>
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