import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 출력 설정 최적화
  output: 'standalone',
  
  // 이미지 최적화 설정
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // 실험적 기능 설정
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
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
          // CSP는 임시로 비활성화 (Next.js 호환성 문제로 인해)
          // 추후 단계적으로 적용 예정
          // {
          //   key: 'Content-Security-Policy',
          //   value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: ws: wss:; frame-ancestors 'none';"
          // }
        ],
      },
    ];
  },
};

export default nextConfig;