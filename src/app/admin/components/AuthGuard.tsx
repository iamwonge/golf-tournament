'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
}

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    loading: true
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAuth({
          isAuthenticated: data.isAuthenticated,
          isAdmin: data.isAdmin,
          loading: false
        });

        if (!data.isAuthenticated || !data.isAdmin) {
          router.push('/admin/login');
        }
      } else {
        setAuth({
          isAuthenticated: false,
          isAdmin: false,
          loading: false
        });
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuth({
        isAuthenticated: false,
        isAdmin: false,
        loading: false
      });
      router.push('/admin/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setAuth({
        isAuthenticated: false,
        isAdmin: false,
        loading: false
      });
      
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 로딩 중
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </motion.div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!auth.isAuthenticated || !auth.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            접근 권한이 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            관리자 로그인이 필요합니다.
          </p>
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            로그인 페이지로 이동
          </button>
        </motion.div>
      </div>
    );
  }

  // 인증된 경우 - 로그아웃 버튼과 함께 컨텐츠 표시
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 인증 바 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                🔐 관리자로 로그인됨
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

