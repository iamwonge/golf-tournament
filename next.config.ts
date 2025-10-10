import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: '/(.*)',
        headers: [
          {
            // XSS 방지
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            // 클릭재킹 방지
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            // CSRF 방지
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            // XSS 보호
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            // CSP 설정 (개발환경 고려)
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production' 
              ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
              : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
          }
        ],
      },
    ];
  },
};

export default nextConfig;