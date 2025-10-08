'use client';

import { useState, useEffect } from 'react';
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

interface ExecutiveTournamentProps {
  loading: boolean;
}

export default function ExecutiveTournament({ loading }: ExecutiveTournamentProps) {
  const [matches, setMatches] = useState<ExecutiveMatch[]>([]);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [tempScores, setTempScores] = useState<{[key: string]: number}>({});
  const [tempTeamData, setTempTeamData] = useState<{[key: string]: {teamName: string, executiveName: string, managerName: string, memberName: string}}>({});

  useEffect(() => {
    // 로컬스토리지에서 데이터 로드
    const savedMatches = localStorage.getItem('executive_tournament_matches');
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    } else {
      // 4개 팀의 초기 데이터
      const initialMatches: ExecutiveMatch[] = [
        { 
          id: '1', 
          round: 1, 
          matchNumber: 1, 
          teamName: 'A팀',
          executiveName: '김대표',
          managerName: '이팀장',
          memberName: '박사원',
          status: 'SCHEDULED' 
        },
        { 
          id: '2', 
          round: 1, 
          matchNumber: 2, 
          teamName: 'B팀',
          executiveName: '이부사장',
          managerName: '정팀장',
          memberName: '최사원',
          status: 'SCHEDULED' 
        },
        { 
          id: '3', 
          round: 1, 
          matchNumber: 3, 
          teamName: 'C팀',
          executiveName: '박전무',
          managerName: '김팀장',
          memberName: '조사원',
          status: 'SCHEDULED' 
        },
        { 
          id: '4', 
          round: 1, 
          matchNumber: 4, 
          teamName: 'D팀',
          executiveName: '정상무',
          managerName: '윤팀장',
          memberName: '한사원',
          status: 'SCHEDULED' 
        }
      ];
      
      setMatches(initialMatches);
      localStorage.setItem('executive_tournament_matches', JSON.stringify(initialMatches));
    }
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

  // 팀 정보 변경 핸들러
  const handleTeamDataChange = (matchId: string, field: string, value: string) => {
    setTempTeamData(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value
      }
    }));
  };

  // 팀 정보 저장 핸들러
  const handleSaveTeamData = (matchId: string) => {
    const tempData = tempTeamData[matchId];
    if (!tempData) return;

    const updatedMatches = matches.map(match => 
      match.id === matchId 
        ? { 
            ...match, 
            teamName: tempData.teamName || match.teamName,
            executiveName: tempData.executiveName || match.executiveName,
            managerName: tempData.managerName || match.managerName,
            memberName: tempData.memberName || match.memberName
          }
        : match
    );
    
    setMatches(updatedMatches);
    localStorage.setItem('executive_tournament_matches', JSON.stringify(updatedMatches));
    
    setEditingTeam(null);
    setTempTeamData(prev => {
      const newData = { ...prev };
      delete newData[matchId];
      return newData;
    });
    
    alert('팀 정보가 저장되었습니다!');
  };

  // 점수 입력 핸들러
  const handleScoreChange = (matchId: string, score: string) => {
    const numScore = parseInt(score) || 0;
    setTempScores(prev => ({
      ...prev,
      [matchId]: numScore
    }));
  };

  // 점수 저장 핸들러
  const handleSaveScore = (matchId: string) => {
    const score = tempScores[matchId];
    if (score === undefined) return;
    
    const updatedMatches = matches.map(match => 
      match.id === matchId 
        ? { ...match, score, status: 'COMPLETED' as const }
        : match
    );
    
    setMatches(updatedMatches);
    localStorage.setItem('executive_tournament_matches', JSON.stringify(updatedMatches));
    
    setEditingMatch(null);
    setTempScores(prev => {
      const newScores = { ...prev };
      delete newScores[matchId];
      return newScores;
    });
    
    alert('점수가 저장되었습니다!');
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">
          👑 경영진 매치게임 관리
        </h1>
        <p className="text-gray-600">점수를 입력하고 저장하면 본페이지에 실시간 반영됩니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">4</div>
          <div className="text-sm text-gray-600">총 참가자</div>
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
                    <div className="text-sm text-yellow-600">경기 결과를 입력해주세요</div>
                  </div>
                );
              }
            })()}
          </div>
        </motion.div>
      </div>

      {/* 최종 점수 결과 - 점수 입력 기능 포함 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">최종 점수 - 점수 입력</h2>
        
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
                {editingTeam === match.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border rounded text-center"
                      placeholder="팀명"
                      defaultValue={match.teamName}
                      onChange={(e) => handleTeamDataChange(match.id, 'teamName', e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full px-2 py-1 border rounded text-center text-sm"
                      placeholder="경영진"
                      defaultValue={match.executiveName}
                      onChange={(e) => handleTeamDataChange(match.id, 'executiveName', e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full px-2 py-1 border rounded text-center text-sm"
                      placeholder="팀장급"
                      defaultValue={match.managerName}
                      onChange={(e) => handleTeamDataChange(match.id, 'managerName', e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full px-2 py-1 border rounded text-center text-sm"
                      placeholder="팀원급"
                      defaultValue={match.memberName}
                      onChange={(e) => handleTeamDataChange(match.id, 'memberName', e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="font-bold text-lg text-gray-800 mb-2">{match.teamName}</div>
                    <div className="text-sm text-red-600 font-semibold">{match.executiveName}</div>
                    <div className="text-sm text-blue-600">{match.managerName}</div>
                    <div className="text-sm text-green-600">{match.memberName}</div>
                  </div>
                )}
              </div>
              
              <div className="text-center mb-3">
                {editingMatch === match.id ? (
                  <input
                    type="number"
                    className="w-20 px-2 py-1 border rounded text-center text-lg font-bold"
                    placeholder="점수"
                    onChange={(e) => handleScoreChange(match.id, e.target.value)}
                  />
                ) : (
                  match.score !== undefined ? (
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {match.score}
                    </div>
                  ) : (
                    <div className="text-xl text-gray-400 mb-1">경기전</div>
                  )
                )}
                <div className="text-sm text-gray-600">타수</div>
              </div>
              
              {index === 0 && match.status === 'COMPLETED' && (
                <div className="mb-3 text-sm font-semibold text-yellow-700">
                  🥇 1위
                </div>
              )}
              
              {/* 버튼들 */}
              <div className="mt-3 space-y-2">
                {editingTeam === match.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveTeamData(match.id)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      팀 저장
                    </button>
                    <button
                      onClick={() => setEditingTeam(null)}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                    >
                      취소
                    </button>
                  </div>
                ) : editingMatch === match.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveScore(match.id)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      점수 저장
                    </button>
                    <button
                      onClick={() => setEditingMatch(null)}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTeam(match.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      팀 수정
                    </button>
                    <button
                      onClick={() => setEditingMatch(match.id)}
                      className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                    >
                      점수 입력
                    </button>
                  </div>
                )}
              </div>
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
                <th className="text-left py-3 px-4">참가자</th>
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
