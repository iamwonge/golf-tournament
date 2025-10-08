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

interface DepartmentTournamentProps {
  loading: boolean;
}

export default function DepartmentTournament({ loading }: DepartmentTournamentProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [tempScores, setTempScores] = useState<{[key: string]: {player1Score: number, player2Score: number}}>({});
  const [tempNames, setTempNames] = useState<{[key: string]: {player1Name: string, player1Department: string, player2Name: string, player2Department: string}}>({});

  useEffect(() => {
    // 로컬스토리지에서 데이터 로드
    const savedMatches = localStorage.getItem('department_tournament_matches');
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    } else {
      // 초기 16강 토너먼트 구조 생성
      const initialMatches: Match[] = [
        // 16강 (8경기)
        ...Array.from({ length: 8 }, (_, i) => ({
          id: `r1_m${i + 1}`,
          round: 1,
          matchNumber: i + 1,
          player1Name: `참가자 ${i * 2 + 1}`,
          player1Department: `본부 ${i * 2 + 1}`,
          player2Name: `참가자 ${i * 2 + 2}`,
          player2Department: `본부 ${i * 2 + 2}`,
          status: 'SCHEDULED' as const
        })),
        // 8강 (4경기)
        ...Array.from({ length: 4 }, (_, i) => ({
          id: `r2_m${i + 1}`,
          round: 2,
          matchNumber: i + 1,
          player1Name: '대기중',
          player1Department: '16강 결과 대기',
          player2Name: '대기중',
          player2Department: '16강 결과 대기',
          status: 'SCHEDULED' as const
        })),
        // 4강 (2경기)
        ...Array.from({ length: 2 }, (_, i) => ({
          id: `r3_m${i + 1}`,
          round: 3,
          matchNumber: i + 1,
          player1Name: '대기중',
          player1Department: '8강 결과 대기',
          player2Name: '대기중',
          player2Department: '8강 결과 대기',
          status: 'SCHEDULED' as const
        })),
        // 결승 (1경기)
        {
          id: 'r4_m1',
          round: 4,
          matchNumber: 1,
          player1Name: '대기중',
          player1Department: '4강 결과 대기',
          player2Name: '대기중',
          player2Department: '4강 결과 대기',
          status: 'SCHEDULED' as const
        }
      ];
      
      setMatches(initialMatches);
      localStorage.setItem('department_tournament_matches', JSON.stringify(initialMatches));
    }
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

  // 참가자 이름/소속 변경 핸들러
  const handleNameChange = (matchId: string, field: string, value: string) => {
    setTempNames(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value
      }
    }));
  };

  // 참가자 정보 저장 핸들러
  const handleSaveNames = (matchId: string) => {
    const tempData = tempNames[matchId];
    if (!tempData) return;

    const updatedMatches = matches.map(match => 
      match.id === matchId 
        ? { 
            ...match, 
            player1Name: tempData.player1Name || match.player1Name,
            player1Department: tempData.player1Department || match.player1Department,
            player2Name: tempData.player2Name || match.player2Name,
            player2Department: tempData.player2Department || match.player2Department
          }
        : match
    );
    
    setMatches(updatedMatches);
    localStorage.setItem('department_tournament_matches', JSON.stringify(updatedMatches));
    
    setEditingPlayer(null);
    setTempNames(prev => {
      const newNames = { ...prev };
      delete newNames[matchId];
      return newNames;
    });
    
    alert('참가자 정보가 저장되었습니다!');
  };

  // 점수 입력 핸들러
  const handleScoreChange = (matchId: string, player: 'player1' | 'player2', score: string) => {
    const numScore = parseInt(score) || 0;
    setTempScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [`${player}Score`]: numScore
      }
    }));
  };

  // 자동 진출 처리 함수
  const advanceWinner = (completedMatch: Match, winnerId: string, updatedMatches: Match[]) => {
    const { round, matchNumber } = completedMatch;
    const nextRound = round + 1;
    
    if (nextRound > 4) return updatedMatches; // 결승 이후는 없음
    
    // 다음 라운드 경기 번호 계산
    const nextMatchNumber = Math.ceil(matchNumber / 2);
    
    // 승자 정보
    const winnerName = winnerId === 'player1' ? completedMatch.player1Name : completedMatch.player2Name;
    const winnerDept = winnerId === 'player1' ? completedMatch.player1Department : completedMatch.player2Department;
    
    return updatedMatches.map(match => {
      if (match.round === nextRound && match.matchNumber === nextMatchNumber) {
        // 홀수 번째 경기 승자는 player1, 짝수 번째는 player2
        if (matchNumber % 2 === 1) {
          return { ...match, player1Name: winnerName, player1Department: winnerDept };
        } else {
          return { ...match, player2Name: winnerName, player2Department: winnerDept };
        }
      }
      return match;
    });
  };

  // 점수 저장 핸들러
  const handleSaveScore = (matchId: string) => {
    const matchScores = tempScores[matchId];
    if (!matchScores) return;

    const { player1Score, player2Score } = matchScores;
    
    // 승자 결정 (낮은 점수가 승리)
    let winnerId = 'player1';
    if (player1Score !== undefined && player2Score !== undefined) {
      winnerId = player1Score < player2Score ? 'player1' : 'player2';
    }

    const currentMatch = matches.find(m => m.id === matchId);
    if (!currentMatch) return;

    let updatedMatches = matches.map(match => 
      match.id === matchId 
        ? { 
            ...match, 
            player1Score,
            player2Score,
            winnerId,
            status: 'COMPLETED' as const
          }
        : match
    );

    // 자동 진출 처리
    updatedMatches = advanceWinner(currentMatch, winnerId, updatedMatches);
    
    setMatches(updatedMatches);
    localStorage.setItem('department_tournament_matches', JSON.stringify(updatedMatches));
    
    setEditingMatch(null);
    setTempScores(prev => {
      const newScores = { ...prev };
      delete newScores[matchId];
      return newScores;
    });
    
    alert('점수가 저장되고 승자가 다음 라운드로 진출했습니다!');
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          🏆 본부별 토너먼트 관리 (16강)
        </h1>
        <p className="text-gray-600">참가자 이름, 소속, 점수를 모두 직접 입력하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">16</div>
          <div className="text-sm text-gray-600">총 참가자</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {matches.filter(m => m.status === 'COMPLETED').length}
          </div>
          <div className="text-sm text-gray-600">완료된 경기</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {matches.filter(m => m.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-sm text-gray-600">진행중 경기</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {matches.filter(m => m.status === 'SCHEDULED').length}
          </div>
          <div className="text-sm text-gray-600">예정된 경기</div>
        </div>
      </div>

      {/* 토너먼트 브래킷 - 16강부터 시작 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">16강 토너먼트 브래킷 - 모든 정보 입력</h2>
        
        <div className="space-y-8">
          {/* 16강 - 가장 먼저 표시 */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-6 text-blue-600">16강</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getMatchesByRound(1).map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-2 rounded-lg p-4 ${getStatusColor(match.status)}`}
                >
                  <div className="text-xs font-semibold mb-3 text-center">
                    경기 {match.matchNumber} - {getStatusText(match.status)}
                  </div>
                  
                  <div className="space-y-3">
                    {/* 참가자 1 */}
                    <div className={`p-3 rounded ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      {editingPlayer === match.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="참가자 이름"
                            defaultValue={match.player1Name}
                            onChange={(e) => handleNameChange(match.id, 'player1Name', e.target.value)}
                          />
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="소속 본부"
                            defaultValue={match.player1Department}
                            onChange={(e) => handleNameChange(match.id, 'player1Department', e.target.value)}
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-sm">{match.player1Name}</div>
                          <div className="text-xs text-gray-600">{match.player1Department}</div>
                        </div>
                      )}
                      
                      {editingMatch === match.id ? (
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded text-center text-sm mt-2"
                          placeholder="점수"
                          onChange={(e) => handleScoreChange(match.id, 'player1', e.target.value)}
                        />
                      ) : (
                        match.player1Score !== undefined && (
                          <div className="font-bold text-center mt-2 text-lg">{match.player1Score}</div>
                        )
                      )}
                    </div>
                    
                    <div className="text-center text-sm text-gray-500 font-semibold">VS</div>
                    
                    {/* 참가자 2 */}
                    <div className={`p-3 rounded ${match.winnerId === 'player2' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      {editingPlayer === match.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="참가자 이름"
                            defaultValue={match.player2Name}
                            onChange={(e) => handleNameChange(match.id, 'player2Name', e.target.value)}
                          />
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="소속 본부"
                            defaultValue={match.player2Department}
                            onChange={(e) => handleNameChange(match.id, 'player2Department', e.target.value)}
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-sm">{match.player2Name}</div>
                          <div className="text-xs text-gray-600">{match.player2Department}</div>
                        </div>
                      )}
                      
                      {editingMatch === match.id ? (
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded text-center text-sm mt-2"
                          placeholder="점수"
                          onChange={(e) => handleScoreChange(match.id, 'player2', e.target.value)}
                        />
                      ) : (
                        match.player2Score !== undefined && (
                          <div className="font-bold text-center mt-2 text-lg">{match.player2Score}</div>
                        )
                      )}
                    </div>
                  </div>
                  
                  {/* 버튼들 */}
                  <div className="mt-3 space-y-2">
                    {editingPlayer === match.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveNames(match.id)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                        >
                          참가자 저장
                        </button>
                        <button
                          onClick={() => setEditingPlayer(null)}
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
                          onClick={() => setEditingPlayer(match.id)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                        >
                          참가자 수정
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

          {/* 8강 */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-6 text-green-600">8강</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getMatchesByRound(2).map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`border-2 rounded-lg p-4 ${getStatusColor(match.status)}`}
                >
                  <div className="text-xs font-semibold mb-3 text-center">
                    경기 {match.matchNumber} - {getStatusText(match.status)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`p-3 rounded text-center ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div className="font-medium">{match.player1Name}</div>
                      <div className="text-xs text-gray-600">{match.player1Department}</div>
                      {match.player1Score !== undefined && (
                        <div className="font-bold text-lg mt-1">{match.player1Score}</div>
                      )}
                    </div>
                    
                    <div className="text-center text-sm text-gray-500 font-semibold">VS</div>
                    
                    <div className={`p-3 rounded text-center ${match.winnerId === 'player2' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div className="font-medium">{match.player2Name}</div>
                      <div className="text-xs text-gray-600">{match.player2Department}</div>
                      {match.player2Score !== undefined && (
                        <div className="font-bold text-lg mt-1">{match.player2Score}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 4강 */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-6 text-orange-600">4강</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {getMatchesByRound(3).map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + index * 0.1 }}
                  className={`border-2 rounded-lg p-6 ${getStatusColor(match.status)}`}
                >
                  <div className="text-sm font-semibold mb-4 text-center">
                    경기 {match.matchNumber} - {getStatusText(match.status)}
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded text-center ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div className="font-medium text-lg">{match.player1Name}</div>
                      <div className="text-sm text-gray-600">{match.player1Department}</div>
                      {match.player1Score !== undefined && (
                        <div className="font-bold text-xl mt-2">{match.player1Score}</div>
                      )}
                    </div>
                    
                    <div className="text-center text-lg text-gray-500 font-semibold">VS</div>
                    
                    <div className={`p-4 rounded text-center ${match.winnerId === 'player2' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div className="font-medium text-lg">{match.player2Name}</div>
                      <div className="text-sm text-gray-600">{match.player2Department}</div>
                      {match.player2Score !== undefined && (
                        <div className="font-bold text-xl mt-2">{match.player2Score}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 결승 */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-8 text-red-600">🏆 결승</h3>
            <div className="max-w-md mx-auto">
              {getMatchesByRound(4).map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4 + index * 0.1 }}
                  className={`border-4 rounded-xl p-8 ${getStatusColor(match.status)} bg-gradient-to-r from-yellow-50 to-red-50`}
                >
                  <div className="text-lg font-bold mb-6 text-center">
                    🏆 {getStatusText(match.status)}
                  </div>
                  
                  <div className="space-y-6">
                    <div className={`p-6 rounded-lg text-center ${match.winnerId === 'player1' ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50'}`}>
                      <div className="font-bold text-xl">{match.player1Name}</div>
                      <div className="text-lg text-gray-600 mt-1">{match.player1Department}</div>
                      {match.player1Score !== undefined && (
                        <div className="font-bold text-3xl mt-3 text-purple-600">{match.player1Score}</div>
                      )}
                    </div>
                    
                    <div className="text-center text-xl text-gray-500 font-bold">VS</div>
                    
                    <div className={`p-6 rounded-lg text-center ${match.winnerId === 'player2' ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50'}`}>
                      <div className="font-bold text-xl">{match.player2Name}</div>
                      <div className="text-lg text-gray-600 mt-1">{match.player2Department}</div>
                      {match.player2Score !== undefined && (
                        <div className="font-bold text-3xl mt-3 text-purple-600">{match.player2Score}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
