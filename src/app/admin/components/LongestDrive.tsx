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

interface LongestDriveProps {
  loading: boolean;
}

export default function LongestDrive({ loading }: LongestDriveProps) {
  const [records, setRecords] = useState<LongestRecord[]>([]);
  const [recordForm, setRecordForm] = useState({
    name: '',
    department: '',
    phone: '',
    email: '',
    distance: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 데이터베이스에서 롱기스트 기록 로드
    const loadRecords = async () => {
      try {
        const response = await fetch('/api/longest');
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
          return;
        }
      } catch (error) {
        console.error('Failed to load longest drive records:', error);
      }
      
      // 데이터베이스 실패 시 로컬스토리지에서 로드
      const savedRecords = localStorage.getItem('longest_drive_records');
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
    
    try {
      // 데이터베이스에 저장
      const response = await fetch('/api/longest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: recordForm.name,
          department: recordForm.department,
          phone: recordForm.phone || undefined,
          email: recordForm.email || undefined,
          distance
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
          createdAt: savedRecord.createdAt
        }].sort((a, b) => b.distance - a.distance);
        setRecords(updatedRecords);
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('Database save failed, using localStorage:', error);
      // 데이터베이스 실패 시 로컬스토리지 사용
      const fallbackRecord: LongestRecord = {
        id: Date.now().toString(),
        playerName: recordForm.name,
        department: recordForm.department,
        phone: recordForm.phone || undefined,
        email: recordForm.email || undefined,
        distance,
        createdAt: new Date().toISOString()
      };
      const updatedRecords = [...records, fallbackRecord].sort((a, b) => b.distance - a.distance);
      setRecords(updatedRecords);
      localStorage.setItem('longest_drive_records', JSON.stringify(updatedRecords));
    }
    
    setRecordForm({ name: '', department: '', phone: '', email: '', distance: '' });
    alert('기록이 등록되었습니다!');
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      const updatedRecords = records.filter(record => record.id !== recordId);
      setRecords(updatedRecords);
      localStorage.setItem('longest_drive_records', JSON.stringify(updatedRecords));
      alert('기록이 삭제되었습니다.');
    }
  };

  const maxDistance = records.length > 0 ? Math.max(...records.map(r => r.distance)) : 0;
  const avgDistance = records.length > 0 
    ? Math.round(records.reduce((sum, r) => sum + r.distance, 0) / records.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">롱기스트 드라이브 관리</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
          기록 초기화
        </button>
      </div>

      {/* 대회 상태 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 rounded-lg p-6 border border-green-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-800">롱기스트 드라이브 챌린지</h3>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            진행중
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-green-600">참가자:</span>
            <span className="font-semibold text-green-800 ml-2">{records.length}명</span>
          </div>
          <div>
            <span className="text-green-600">최고 기록:</span>
            <span className="font-semibold text-green-800 ml-2">{maxDistance}m</span>
          </div>
          <div>
            <span className="text-green-600">평균 거리:</span>
            <span className="font-semibold text-green-800 ml-2">{avgDistance}m</span>
          </div>
          <div>
            <span className="text-green-600">총 시도:</span>
            <span className="font-semibold text-green-800 ml-2">{records.length}회</span>
          </div>
        </div>
      </motion.div>

      {/* 기록 입력 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-50 rounded-lg p-6"
      >
        <h3 className="text-lg font-medium text-gray-800 mb-4">롱기스트 드라이브 기록 입력</h3>
        <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="참가자 이름 *"
            value={recordForm.name}
            onChange={(e) => setRecordForm({ ...recordForm, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={submitting}
          />
          <input
            type="text"
            placeholder="소속 본부 *"
            value={recordForm.department}
            onChange={(e) => setRecordForm({ ...recordForm, department: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={submitting}
          />
          <input
            type="tel"
            placeholder="전화번호"
            value={recordForm.phone}
            onChange={(e) => setRecordForm({ ...recordForm, phone: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={submitting}
          />
          <input
            type="email"
            placeholder="이메일"
            value={recordForm.email}
            onChange={(e) => setRecordForm({ ...recordForm, email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={submitting}
          />
          <input
            type="number"
            step="0.1"
            placeholder="거리 (m) *"
            value={recordForm.distance}
            onChange={(e) => setRecordForm({ ...recordForm, distance: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
        <h3 className="text-lg font-medium text-gray-800 mb-4">롱기스트 순위표</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
                <th className="text-right py-3 px-4">기록일</th>
                <th className="text-center py-3 px-4">액션</th>
              </tr>
            </thead>
            <tbody>
              {records
                .sort((a, b) => b.distance - a.distance)
                .map((record, index) => (
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
                  <td className="py-3 px-4 text-right font-bold text-green-600">{record.distance}m</td>
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
              ))}
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
