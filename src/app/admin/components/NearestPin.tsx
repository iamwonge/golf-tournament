'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NearestRecord {
  id: string;
  playerName: string;
  department: string;
  phone?: string;
  email?: string;
  distance: number;
  accuracy: number;
  createdAt: string;
}

interface NearestPinProps {
  loading: boolean;
}

const TARGET_DISTANCE = 51; // 니어핀 목표 거리 (핀까지)

export default function NearestPin({ loading }: NearestPinProps) {
  const [records, setRecords] = useState<NearestRecord[]>([]);
  const [recordForm, setRecordForm] = useState({
    name: '',
    department: '',
    phone: '',
    email: '',
    distance: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 데이터베이스에서 니어핀 기록 로드
    const loadRecords = async () => {
      try {
        const response = await fetch('/api/nearest');
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
          return;
        }
      } catch (error) {
        console.error('Failed to load nearest pin records:', error);
      }
      
      // 데이터베이스 실패 시 로컬스토리지에서 로드
      const savedRecords = localStorage.getItem('nearest_pin_records');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    };
    
    loadRecords();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recordForm.name || !recordForm.department || !recordForm.distance) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const distance = parseFloat(recordForm.distance);
    const accuracy = Math.abs(TARGET_DISTANCE - distance); // 목표 거리와의 차이 (절댓값)

    try {
      // 데이터베이스에 저장
      const response = await fetch('/api/nearest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: recordForm.name,
          department: recordForm.department,
          phone: recordForm.phone || undefined,
          email: recordForm.email || undefined,
          distance,
          accuracy: distance // 니어핀은 거리 자체가 정확도
        })
      });

      if (response.ok) {
        const savedRecord = await response.json();
        const updatedRecords = [...records, {
          id: savedRecord.id,
          playerName: savedRecord.playerName,
          department: savedRecord.department,
          phone: savedRecord.phone,
          email: savedRecord.email,
          distance: savedRecord.distance,
          accuracy: savedRecord.accuracy,
          createdAt: savedRecord.createdAt
        }];
        setRecords(updatedRecords);
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('Database save failed, using localStorage:', error);
      // 데이터베이스 실패 시 로컬스토리지 사용
      const fallbackRecord: NearestRecord = {
        id: Date.now().toString(),
        playerName: recordForm.name,
        department: recordForm.department,
        phone: recordForm.phone || undefined,
        email: recordForm.email || undefined,
        distance,
        accuracy: distance,
        createdAt: new Date().toISOString()
      };
      const updatedRecords = [...records, fallbackRecord];
      setRecords(updatedRecords);
      localStorage.setItem('nearest_pin_records', JSON.stringify(updatedRecords));
    }
    
    setRecordForm({ name: '', department: '', phone: '', email: '', distance: '' });
    alert('기록이 등록되었습니다!');
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      const updatedRecords = records.filter(record => record.id !== recordId);
      setRecords(updatedRecords);
      localStorage.setItem('nearest_pin_records', JSON.stringify(updatedRecords));
      alert('기록이 삭제되었습니다.');
    }
  };

  const bestAccuracy = records.length > 0 
    ? Math.min(...records.map(r => r.distance))
    : 0;
  
  const avgAccuracy = records.length > 0 
    ? records.reduce((sum, r) => sum + r.accuracy, 0) / records.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">니어핀 챌린지 관리</h2>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
          기록 초기화
        </button>
      </div>

      {/* 대회 상태 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 rounded-lg p-6 border border-red-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-800">니어핀 챌린지</h3>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            진행중
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-red-600">참가자:</span>
            <span className="font-semibold text-red-800 ml-2">{records.length}명</span>
          </div>
          <div>
            <span className="text-red-600">목표 거리:</span>
            <span className="font-semibold text-red-800 ml-2">{TARGET_DISTANCE}m</span>
          </div>
          <div>
            <span className="text-red-600">최고 근접도:</span>
            <span className="font-semibold text-red-800 ml-2">±{bestAccuracy.toFixed(1)}m</span>
          </div>
          <div>
            <span className="text-red-600">평균 근접도:</span>
            <span className="font-semibold text-red-800 ml-2">±{avgAccuracy.toFixed(1)}m</span>
          </div>
        </div>
      </motion.div>

      {/* 참가자 등록 및 기록 입력 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-50 rounded-lg p-6"
      >
        <h3 className="text-lg font-medium text-gray-800 mb-4">참가자 등록 및 기록 입력</h3>
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="text-red-600 mr-2">🎪</div>
            <div className="font-medium text-red-800">니어핀 챌린지 규칙</div>
          </div>
          <div className="text-sm text-red-700">
            • 목표: <strong>{TARGET_DISTANCE}m 지점의 핀에 최대한 가깝게</strong><br/>
            • 볼이 멈춘 지점에서 핀까지의 거리를 입력하세요<br/>
            • 정확도 = 핀까지의 거리 (절댓값)<br/>
            • 거리가 짧을수록 좋은 기록입니다
          </div>
        </div>
        
        <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="참가자 이름 *"
            value={recordForm.name}
            onChange={(e) => setRecordForm({ ...recordForm, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            disabled={submitting}
          />
          <input
            type="text"
            placeholder="소속 본부 *"
            value={recordForm.department}
            onChange={(e) => setRecordForm({ ...recordForm, department: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            disabled={submitting}
          />
          <input
            type="tel"
            placeholder="전화번호"
            value={recordForm.phone}
            onChange={(e) => setRecordForm({ ...recordForm, phone: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={submitting}
          />
          <input
            type="email"
            placeholder="이메일"
            value={recordForm.email}
            onChange={(e) => setRecordForm({ ...recordForm, email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={submitting}
          />
          <input
            type="number"
            step="0.1"
            placeholder="핀까지의 거리 (m) *"
            value={recordForm.distance}
            onChange={(e) => setRecordForm({ ...recordForm, distance: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? '등록 중...' : '기록 등록'}
          </button>
        </form>
      </motion.div>

      {/* 순위표 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-x-auto"
      >
        <h3 className="text-lg font-medium text-gray-800 mb-4">니어핀 근접도 순위표</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center py-3 px-4">순위</th>
                <th className="text-left py-3 px-4">참가자</th>
                <th className="text-left py-3 px-4">소속</th>
                <th className="text-right py-3 px-4">거리</th>
                <th className="text-right py-3 px-4">핀까지 거리 (오차)</th>
                <th className="text-right py-3 px-4">기록일</th>
                <th className="text-center py-3 px-4">액션</th>
              </tr>
            </thead>
            <tbody>
              {records
                .sort((a, b) => (a.accuracy || 999) - (b.accuracy || 999))
                .map((record, index) => {
                  const accuracy = record.accuracy || 0;
                  
                  return (
                    <motion.tr 
                      key={record.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{record.playerName}</td>
                      <td className="py-3 px-4 text-gray-600">{record.department}</td>
                      <td className="py-3 px-4 text-right font-bold text-red-600">
                        {record.distance.toFixed(2)}m
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className={`font-bold ${
                          accuracy <= 1.0 ? 'text-green-600' :
                          accuracy <= 2.0 ? 'text-yellow-600' :
                          accuracy <= 5.0 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          ±{accuracy.toFixed(2)}m
                        </div>
                        <div className="text-xs text-gray-500">
                          목표: {TARGET_DISTANCE}m
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => {/* TODO: 수정 기능 */}}
                          className="text-blue-600 hover:text-blue-800 text-sm mr-2"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          삭제
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    등록된 기록이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
