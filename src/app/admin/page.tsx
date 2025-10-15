'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminData } from './hooks/useAdminData';
import AuthGuard from './components/AuthGuard';
import DashboardTab from './components/DashboardTab';
import MaleLongestDrive from './components/MaleLongestDrive';
import FemaleLongestDrive from './components/FemaleLongestDrive';
import DepartmentTournament from './components/DepartmentTournament';
import ExecutiveTournament from './components/ExecutiveTournament';
import PuttingGame from './components/PuttingGame';
import NearestPin from './components/NearestPin';
import PhotoGallery from './components/PhotoGallery';

type TabType = 'dashboard' | 'department' | 'executive' | 'male-longest' | 'female-longest' | 'putting' | 'nearest' | 'photos' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const {
    users,
    tournaments,
    records,
    loading,
    error,
    loadData,
    addUser,
    updateUser,
    deleteUser,
    addRecord,
    addRecordByType,
    deleteRecord,
    getRecordsByType,
    getTournamentParticipants,
    getMatchesWithUsers,
    
    // 시드 관련 함수들
    assignSeed,
    autoAssignSeeds,
    clearAllSeeds,
    
    // 토너먼트 관련 함수들
    generateTournamentBracket
  } = useAdminData();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ 오류 발생</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-8">
      {/* 헤더 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ⚙️ 관리자 대시보드
        </h1>
        <p className="text-gray-600">골프 대회 참가자 등록 및 결과 관리</p>
      </motion.div>

      {/* 통계 카드 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-gray-600">총 참가자</div>
        </div>
        <div className="bg-white dark:bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{tournaments.length}</div>
          <div className="text-sm text-gray-600">토너먼트</div>
        </div>
        <div className="bg-white dark:bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {tournaments.flatMap(t => t.matches || []).filter((m: any) => m.status === 'COMPLETED').length}
          </div>
          <div className="text-sm text-gray-600">완료된 경기</div>
        </div>
        <div className="bg-white dark:bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{records.length}</div>
          <div className="text-sm text-gray-600">등록된 기록</div>
        </div>
      </motion.div>

      {/* 탭 네비게이션 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-white rounded-lg shadow-md"
      >
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap px-6">
            {[
              { id: 'dashboard', name: '대시보드', icon: '📊' },
              { id: 'department', name: '본부별 토너먼트', icon: '🏆' },
              { id: 'executive', name: '경영진 매치', icon: '👑' },
              { id: 'male-longest', name: '남자 롱기스트', icon: '🚀' },
              { id: 'female-longest', name: '여자 롱기스트', icon: '💃' },
              { id: 'putting', name: '퍼팅게임', icon: '🎯' },
              { id: 'nearest', name: '니어핀 챌린지', icon: '🎪' },
              { id: 'photos', name: '사진 갤러리', icon: '📸' },
              { id: 'settings', name: '시스템 설정', icon: '⚙️' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 탭 컨텐츠 */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
          {activeTab === 'dashboard' && (
              <DashboardTab 
                users={users}
                tournaments={tournaments}
                records={records}
              />
            )}


            {activeTab === 'male-longest' && (
              <MaleLongestDrive
                loading={loading}
              />
            )}

            {activeTab === 'female-longest' && (
              <FemaleLongestDrive
                loading={loading}
              />
            )}

            {activeTab === 'department' && (
              <DepartmentTournament
                loading={loading}
              />
            )}

          {activeTab === 'executive' && (
              <ExecutiveTournament
                loading={loading}
              />
            )}

          {activeTab === 'putting' && (
              <PuttingGame
                loading={loading}
              />
            )}

          {activeTab === 'nearest' && (
              <NearestPin
                loading={loading}
              />
            )}

          {activeTab === 'photos' && (
              <PhotoGallery />
            )}

          {activeTab === 'settings' && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">시스템 설정</h3>
                <p className="text-gray-600">이 기능은 곧 추가될 예정입니다.</p>
        </div>
            )}
          </motion.div>
                  </div>
      </motion.div>

      {/* 로딩 오버레이 */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">데이터를 처리하는 중...</p>
                </div>
        </motion.div>
      )}
      </div>
    </AuthGuard>
  );
}