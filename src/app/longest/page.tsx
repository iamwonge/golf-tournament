'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LongestRecord {
  id: string;
  playerName: string;
  department: string;
  phone?: string;
  email?: string;
  distance: number;
  createdAt: string;
}

export default function LongestPage() {
  const [records, setRecords] = useState<LongestRecord[]>([]);

  useEffect(() => {
    // 관리자 페이지와 동일한 로컬스토리지 사용
    const loadRecords = () => {
      const savedRecords = localStorage.getItem('longest_drive_records');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    };

    loadRecords();
    
    // 1초마다 데이터 새로고침 (실시간 연동)
    const interval = setInterval(loadRecords, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const sortedRecords = records.sort((a, b) => b.distance - a.distance);

  const getDistanceColor = (distance: number) => {
    if (distance >= 300) return 'text-yellow-600'; // 금색
    if (distance >= 250) return 'text-green-600';  // 초록색
    if (distance >= 200) return 'text-orange-600'; // 주황색
    return 'text-red-600'; // 빨간색
  };

  const getBarColor = (distance: number) => {
    if (distance >= 300) return 'bg-yellow-500';
    if (distance >= 250) return 'bg-green-500';
    if (distance >= 200) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const maxDistance = records.length > 0 ? Math.max(...records.map(r => r.distance)) : 0;

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          🚀 롱기스트 대회
        </h1>
        <p className="text-gray-600">가장 긴 거리를 기록한 참가자가 승리합니다!</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{records.length}</div>
          <div className="text-sm text-gray-600">총 참가자</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-yellow-600">{maxDistance}m</div>
          <div className="text-sm text-gray-600">최고 기록</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {records.length > 0 ? (records.reduce((sum, r) => sum + r.distance, 0) / records.length).toFixed(1) : 0}m
          </div>
          <div className="text-sm text-gray-600">평균 거리</div>
        </div>
      </div>

      {/* 시각화 차트 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">거리 시각화</h2>
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
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>
              
              {/* 골퍼 아이콘 */}
              <div className="text-2xl">🏌️</div>
              
              {/* 거리 바 */}
              <div className="flex-1 relative">
                <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(record.distance / maxDistance) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full rounded-full ${getBarColor(record.distance)} flex items-center justify-end pr-2`}
                  >
                    <span className="text-white font-semibold text-sm">
                      {record.distance}m
                    </span>
                  </motion.div>
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

        {/* 거리 마일스톤 */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500">
            <span>0m</span>
            <span>100m</span>
            <span>200m</span>
            <span>250m</span>
            <span>300m</span>
            <span>350m+</span>
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
                <th className="text-right py-3 px-4">기록일</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {index === 0 && <span className="mr-2">👑</span>}
                      <span className="font-semibold">{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{record.playerName}</td>
                  <td className="py-3 px-4 text-gray-600">{record.department}</td>
                  <td className={`py-3 px-4 text-right font-bold ${getDistanceColor(record.distance)}`}>
                    {record.distance}m
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500">
                    {new Date(record.createdAt).toLocaleDateString('ko-KR')}
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
