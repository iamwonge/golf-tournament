'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: '/', label: '홈', icon: '🏠' },
    { href: '/tournament/department', label: '본부별 토너먼트', icon: '🏆' },
    { href: '/tournament/executive', label: '경영진 매치', icon: '👑' },
    { href: '/longest/male', label: '남자 롱기스트', icon: '🚀' },
    { href: '/longest/female', label: '여자 롱기스트', icon: '💃' },
    { href: '/putting', label: '퍼팅게임', icon: '🎯' },
    { href: '/nearest', label: '니어핀', icon: '🎪' },
    { href: '/gallery', label: '사진갤러리', icon: '📸' },
    { href: '/admin', label: '관리자', icon: '⚙️' },
  ];

  return (
    <>
      {/* 햄버거 메뉴 버튼 - 모바일에서만 표시 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="메뉴 열기"
      >
        {isOpen ? (
          <span className="text-2xl text-gray-800">✕</span>
        ) : (
          <span className="text-2xl text-gray-800">☰</span>
        )}
      </button>

      {/* 데스크톱 메뉴 - md 이상에서만 표시 */}
      <div className="hidden md:flex items-center space-x-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-green-50 whitespace-nowrap"
          >
            <span className="hidden lg:inline mr-1">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* 모바일 오버레이 메뉴 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            />
            
            {/* 메뉴 패널 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 md:hidden"
            >
              <div className="p-6">
                {/* 메뉴 헤더 */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-800">메뉴</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    aria-label="메뉴 닫기"
                  >
                    <span className="text-gray-500 text-xl">×</span>
                  </button>
                </div>

                {/* 메뉴 아이템들 */}
                <nav className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-gray-700 font-medium group-hover:text-green-600">
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
