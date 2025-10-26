'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  player1Name: string;
  player1Name2?: string;
  player1Name3?: string;
  player1Department: string;
  player2Name: string;
  player2Name2?: string;
  player2Name3?: string;
  player2Department: string;
  player1Score?: number | null;
  player2Score?: number | null;
  winnerId?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'BYE';
  scheduledDate?: string;
}

export default function DepartmentTournamentPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    // 데이터베이스에서 토너먼트 매치 데이터 로드
    const loadMatches = async () => {
      try {
        const response = await fetch('/api/tournaments/matches');
        if (response.ok) {
          const data = await response.json();
          // 데이터베이스에서 가져온 데이터를 Match 형식으로 변환
          const mappedMatches = data.map((match: any) => ({
            id: match.id,
            round: match.round,
            matchNumber: match.matchNumber,
            player1Name: match.player1Name || match.player1?.name || '대기중',
            player1Name2: match.player1Name2 || '',
            player1Name3: match.player1Name3 || '',
            player1Department: match.player1Department || match.player1?.department || '대기중',
            player2Name: match.player2Name || match.player2?.name || '대기중',
            player2Name2: match.player2Name2 || '',
            player2Name3: match.player2Name3 || '',
            player2Department: match.player2Department || match.player2?.department || '대기중',
            player1Score: match.player1Score,
            player2Score: match.player2Score,
            winnerId: match.winnerId,
            status: match.status,
            scheduledDate: match.scheduledDate || ''
          }));
          setMatches(mappedMatches);
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

      {/* 대회 정보 아코디언 */}
      <div className="bg-white dark:bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => setIsInfoOpen(!isInfoOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            <h2 className="text-lg font-semibold text-gray-800">스크린 골프 대회 기본 정보</h2>
          </div>
          <motion.div
            animate={{ rotate: isInfoOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: isInfoOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 대회 규칙 */}
              <div>
                <h3 className="text-md font-semibold text-green-700 mb-3 flex items-center gap-2">
                    대회 규칙
                </h3>
                <div className="bg-green-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <p className="text-gray-700"><span className="font-medium">플레이:</span> 18홀 플레이</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <p className="text-gray-700"><span className="font-medium">방식:</span> 3인포썸 방식 진행 (끝나는 순서대로 티샷 진행)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <p className="text-gray-700"><span className="font-medium">플레이 CC:</span> 테디밸리 (16강)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <p className="text-gray-700"><span className="font-medium">멀리건:</span> 인당 1개씩 사용가능 (타인원 양도 불가)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <p className="text-gray-700"><span className="font-medium">퍼팅 퍼터 돌리기:</span> 허용</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <p className="text-gray-700"><span className="font-medium">개인공:</span> 사용 가능</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <p className="text-gray-700"><span className="font-medium">개인 골프채:</span> 사용 가능하되 불가 시 비치되어있는 골프채 사용 가능</p>
                  </div>
                </div>
              </div>

              {/* 비치 골프채 사양 */}
              <div>
                <h3 className="text-md font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    비치 골프채 사양
                </h3>
                <div className="bg-orange-50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="border-b border-orange-200 pb-2">
                    <p className="font-semibold text-orange-700">아이언</p>
                    <p className="text-gray-700">타이틀리스트 T150 + 다골 S200</p>
                  </div>
                  <div className="border-b border-orange-200 pb-2">
                    <p className="font-semibold text-orange-700">드라이버</p>
                    <p className="text-gray-700">타이틀리스트 TSR + 벤투스 TR 블루 60S</p>
                  </div>
                  <div className="border-b border-orange-200 pb-2">
                    <p className="font-semibold text-orange-700">웨지</p>
                    <p className="text-gray-700">타이틀리스트 보키 + 웨지플렉스</p>
                    <p className="text-gray-600 text-xs mt-1">60°, 56°, 52°</p>
                  </div>
                  <div className="border-b border-orange-200 pb-2">
                    <p className="font-semibold text-orange-700">유틸리티</p>
                    <p className="text-gray-700">핑 G430</p>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-700">퍼터</p>
                    <p className="text-gray-700">스카티카메론 스퀘어백 34인치</p>
                  </div>
                </div>
              </div>

              {/* 스크린골프 장비 정보 */}
              <div className="md:col-span-2">
                <div>
                  <h3 className="text-md font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      스크린골프 장비
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium min-w-[60px]">장비:</span>
                      <div>
                        <p className="text-gray-700">QED 아이샷 아이미니 (EYE MINI)</p>
                        <a 
                          href="https://qedgolfshop.com/104/?idx=363" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          장비 상세보기 →
                        </a>
                      </div>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium mb-2">📹 소개 영상</p>
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          src="https://www.youtube.com/embed/MvtT8C15-KM"
                          title="소개 영상"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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
                    {match.scheduledDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        📅 {match.scheduledDate}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`flex justify-between items-center p-3 rounded ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div>
                        <div className="font-medium">{match.player1Name}</div>
                        {match.player1Name2 && <div className="text-xs text-gray-700">{match.player1Name2}</div>}
                        {match.player1Name3 && <div className="text-xs text-gray-700">{match.player1Name3}</div>}
                        <div className="text-xs text-gray-600">{match.player1Department}</div>
                      </div>
                      {match.player1Score !== undefined && match.player1Score !== null && (
                        <div className="font-bold">{match.player1Score}</div>
                      )}
                    </div>
                    
                    <div className="text-center text-xs text-gray-500 font-semibold">VS</div>
                    
                    <div className={`flex justify-between items-center p-3 rounded ${match.winnerId === 'player2' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                      <div>
                        <div className="font-medium">{match.player2Name}</div>
                        {match.player2Name2 && <div className="text-xs text-gray-700">{match.player2Name2}</div>}
                        {match.player2Name3 && <div className="text-xs text-gray-700">{match.player2Name3}</div>}
                        <div className="text-xs text-gray-600">{match.player2Department}</div>
                      </div>
                      {match.player2Score !== undefined && match.player2Score !== null && (
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
                      {match.scheduledDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          📅 {match.scheduledDate}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`flex justify-between items-center p-3 rounded ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <div>
                          <div className="font-medium">{match.player1Name}</div>
                          {match.player1Name2 && <div className="text-xs text-gray-700">{match.player1Name2}</div>}
                          {match.player1Name3 && <div className="text-xs text-gray-700">{match.player1Name3}</div>}
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
                          {match.player2Name2 && <div className="text-xs text-gray-700">{match.player2Name2}</div>}
                          {match.player2Name3 && <div className="text-xs text-gray-700">{match.player2Name3}</div>}
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
                      {match.scheduledDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          📅 {match.scheduledDate}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`flex justify-between items-center p-2 rounded text-sm ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div>
                          <div className="font-medium">{match.player1Name}</div>
                          {match.player1Name2 && <div className="text-xs text-gray-700">{match.player1Name2}</div>}
                          {match.player1Name3 && <div className="text-xs text-gray-700">{match.player1Name3}</div>}
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
                          {match.player2Name2 && <div className="text-xs text-gray-700">{match.player2Name2}</div>}
                          {match.player2Name3 && <div className="text-xs text-gray-700">{match.player2Name3}</div>}
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
                      {match.scheduledDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          📅 {match.scheduledDate}
                        </div>
                      )}
                    </div>
                    
                    {match.status === 'BYE' ? (
                      <div className="text-center">
                        <div className="font-medium text-sm">{match.player1Name}</div>
                        {match.player1Name2 && <div className="text-xs text-gray-700">{match.player1Name2}</div>}
                        {match.player1Name3 && <div className="text-xs text-gray-700">{match.player1Name3}</div>}
                        <div className="text-xs text-gray-600">{match.player1Department}</div>
                        <div className="text-xs font-semibold text-blue-600 mt-1">부전승</div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className={`p-1 rounded text-xs ${match.winnerId === 'player1' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <div className="font-medium">{match.player1Name}</div>
                          {match.player1Name2 && <div className="text-xs text-gray-700">{match.player1Name2}</div>}
                          {match.player1Name3 && <div className="text-xs text-gray-700">{match.player1Name3}</div>}
                          <div className="text-xs text-gray-600 truncate">{match.player1Department}</div>
                          {match.player1Score !== undefined && (
                            <div className="font-bold text-center">{match.player1Score}</div>
                          )}
                        </div>
                        
                        <div className="text-center text-xs text-gray-500">VS</div>
                        
                        <div className={`p-1 rounded text-xs ${match.winnerId === 'player2' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <div className="font-medium">{match.player2Name}</div>
                          {match.player2Name2 && <div className="text-xs text-gray-700">{match.player2Name2}</div>}
                          {match.player2Name3 && <div className="text-xs text-gray-700">{match.player2Name3}</div>}
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
                      {match.player1Name2 && <div className="text-sm text-gray-700">{match.player1Name2}</div>}
                      {match.player1Name3 && <div className="text-sm text-gray-700">{match.player1Name3}</div>}
                      <div className="text-sm text-gray-600">{match.player1Department}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {match.player1Score} - {match.player2Score}
                  </td>
                  <td className="py-3 px-4">
                    <div className={match.winnerId === 'player2' ? 'font-bold text-green-600' : ''}>
                      {match.player2Name}
                      {match.player2Name2 && <div className="text-sm text-gray-700">{match.player2Name2}</div>}
                      {match.player2Name3 && <div className="text-sm text-gray-700">{match.player2Name3}</div>}
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