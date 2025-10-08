'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PuttingRecord {
  id: string;
  playerName: string;
  department: string;
  phone?: string;
  email?: string;
  distance: number;
  accuracy: number;
  createdAt: string;
}

const TARGET_DISTANCE = 19.74; // 퍼팅 목표 거리

export default function PuttingPage() {
  const [records, setRecords] = useState<PuttingRecord[]>([]);

  useEffect(() => {
    // 데이터베이스에서 퍼팅 기록 로드
    const loadRecords = async () => {
      try {
        const response = await fetch('/api/putting');
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        } else {
          console.error('Failed to load putting records');
        }
      } catch (error) {
        console.error('Error loading putting records:', error);
      }
    };

    loadRecords();
    
    // 5초마다 데이터 새로고침 (실시간 연동)
    const interval = setInterval(loadRecords, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const sortedRecords = records.sort((a, b) => a.accuracy - b.accuracy); // 정확도 높은 순 (차이가 작을수록 좋음)

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 0.5) return 'text-yellow-600'; // 0.5m 이내 - 금색
    if (accuracy <= 1.0) return 'text-green-600';  // 1.0m 이내 - 초록색
    if (accuracy <= 2.0) return 'text-orange-600'; // 2.0m 이내 - 주황색
    return 'text-red-600'; // 2.0m 초과 - 빨간색
  };

  const getBarColor = (accuracy: number) => {
    if (accuracy <= 0.5) return 'bg-yellow-500';
    if (accuracy <= 1.0) return 'bg-green-500';
    if (accuracy <= 2.0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">
          ⛳ 퍼팅게임
        </h1>
        <p className="text-gray-600">19.74m 목표 거리에 최대한 정확하게 퍼팅하는 정밀도 게임!</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{records.length}</div>
          <div className="text-sm text-gray-600">총 참가자</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {records.length > 0 ? Math.min(...records.map(r => r.accuracy)).toFixed(2) : 0}m
          </div>
          <div className="text-sm text-gray-600">최고 정확도 (가장 가까운 거리)</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {records.length > 0 ? (records.reduce((sum, r) => sum + r.accuracy, 0) / records.length).toFixed(2) : 0}m
          </div>
          <div className="text-sm text-gray-600">평균 오차</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {records.filter(r => r.accuracy <= 1.0).length}
          </div>
          <div className="text-sm text-gray-600">1m 이내 달성</div>
        </div>
      </div>

      {/* 시각화 차트 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">정확도 시각화</h2>
        <div className="space-y-4">
          {sortedRecords.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              {/* 순위 */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                index === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-gray-50 text-gray-600'
              }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>

              {/* 정확도 바 */}
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(10, 100 - record.accuracy * 10)}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  className={`h-full rounded-full ${getBarColor(record.accuracy)}`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white drop-shadow">
                    {record.distance.toFixed(2)}m (오차: ±{record.accuracy.toFixed(2)}m)
                  </span>
                </div>
              </div>

              {/* 골프공 아이콘 */}
              <div className="text-xl">⚪</div>
              
              {/* 참가자 정보 */}
              <div className="w-32 text-right">
                <div className="font-semibold text-gray-800">{record.playerName}</div>
                <div className="text-sm text-gray-600">{record.department}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 정확도 마일스톤 */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>90%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* 순위표 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">순위표</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">순위</th>
                <th className="text-left py-3 px-4">참가자</th>
                <th className="text-left py-3 px-4">소속</th>
                <th className="text-right py-3 px-4">거리</th>
                <th className="text-right py-3 px-4">정확도</th>
                <th className="text-right py-3 px-4">기록일</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record, index) => (
                <motion.tr 
                  key={record.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{record.playerName}</td>
                  <td className="py-3 px-4 text-gray-600">{record.department}</td>
                  <td className="py-3 px-4 text-right font-bold text-purple-600">
                    {record.distance.toFixed(2)}m
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${getAccuracyColor(record.accuracy)}`}>
                    ±{record.accuracy.toFixed(2)}m
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500">
                    {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 게임 설명 */}
      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">⛳ 퍼팅게임 규칙</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
          <div>
            <h4 className="font-semibold mb-2">게임 방식</h4>
            <ul className="space-y-1">
              <li>• 목표: 19.74m 거리에 정확하게 퍼팅하기</li>
              <li>• 목표 거리에 가까울수록 좋은 기록</li>
              <li>• 오차 = |목표거리 - 실제거리|</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">점수 기준</h4>
            <ul className="space-y-1">
              <li>• <span className="text-yellow-600">🥇 0.5m 이내</span>: 완벽한 퍼팅!</li>
              <li>• <span className="text-green-600">🥈 1.0m 이내</span>: 훌륭한 퍼팅!</li>
              <li>• <span className="text-orange-600">🥉 2.0m 이내</span>: 좋은 퍼팅!</li>
              <li>• <span className="text-red-600">⚪ 2.0m 초과</span>: 연습이 필요해요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}