import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileNav from "./components/MobileNav";

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
      <head>
        <meta name="color-scheme" content="light only" />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root, body {
              color-scheme: light;
              background-color: #fff !important;
              color: #000 !important;
            }
            * {
              color-scheme: light;
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {/* 반응형 네비게이션 */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* 로고 및 제목 */}
              <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                <img 
                  src="/kyungshin logo.png" 
                  alt="경신 로고" 
                  className="h-8 w-auto md:h-12 flex-shrink-0"
                />
                <div className="text-sm md:text-xl font-bold text-gray-800 truncate">
                  <span className="hidden sm:inline">2025 경신 스크린골프 대회</span>
                  <span className="sm:hidden">경신 골프대회</span>
                </div>
              </div>

              {/* 네비게이션 메뉴 */}
              <div className="flex items-center">
                <MobileNav />
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
