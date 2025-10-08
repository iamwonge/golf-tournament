import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "사내 골프 대회",
  description: "사내 골프 대회 토너먼트 및 경기 결과",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {/* KPGA 스타일 네비게이션 */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <div className="flex items-center space-x-4">
                  <img 
                    src="/kyungshin logo.png" 
                    alt="경신 로고" 
                    className="h-12 w-auto"
                  />
                  <div className="text-xl font-bold text-gray-800">
                    2025 경신 스크린골프 대회
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <a href="/" className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-green-50">
                  홈
                </a>
                <a href="/tournament/department" className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-green-50">
                  본부별 토너먼트
                </a>
                <a href="/tournament/executive" className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-green-50">
                  경영진 매치
                </a>
                <a href="/longest" className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-green-50">
                  롱기스트
                </a>
                <a href="/putting" className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-green-50">
                  퍼팅게임
                </a>
                <a href="/nearest" className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-green-50">
                  니어핀
                </a>
              </div>
            </div>
          </div>
        </nav>
        
        {/* 메인 컨텐츠 */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        
        {/* 푸터 */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-500 text-sm">
              <p>&copy; 2025 사내 골프 대회. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
