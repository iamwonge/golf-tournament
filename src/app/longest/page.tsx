'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LongestPage() {
  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          🚀 롱기스트 대회
        </h1>
        <p className="text-gray-600">성별을 선택하여 롱기스트 대회 결과를 확인하세요!</p>
      </div>

      {/* 성별 선택 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* 남자 롱기스트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group"
        >
          <Link href="/longest/male">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">🏌️‍♂️</div>
                <h2 className="text-2xl font-bold mb-2">남자 롱기스트</h2>
                <p className="text-blue-100 mb-4">남자부 가장 긴 드라이브 거리 경쟁</p>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <span className="text-sm font-medium">결과 보기 →</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 여자 롱기스트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group"
        >
          <Link href="/longest/female">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-8 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">🏌️‍♀️</div>
                <h2 className="text-2xl font-bold mb-2">여자 롱기스트</h2>
                <p className="text-pink-100 mb-4">여자부 가장 긴 드라이브 거리 경쟁</p>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <span className="text-sm font-medium">결과 보기 →</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* 안내 메시지 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto text-center"
      >
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">롱기스트 드라이브 챌린지</h3>
        <p className="text-gray-600 text-sm">
          남녀 구분하여 가장 긴 드라이브 거리를 기록한 참가자가 우승합니다.<br/>
          실시간으로 업데이트되는 순위를 확인해보세요!
        </p>
      </motion.div>
    </div>
  );
}
