'use client';

import Link from "next/link";
import PhotoGallery from "./components/PhotoGallery";
import { useState, useEffect } from 'react';

interface RecordCounts {
  longest: number;
  putting: number;
  nearest: number;
}

export default function Home() {
  const [recordCounts, setRecordCounts] = useState<RecordCounts>({
    longest: 0,
    putting: 0,
    nearest: 0
  });

  useEffect(() => {
    const fetchRecordCounts = async () => {
      try {
        const [longestRes, puttingRes, nearestRes] = await Promise.all([
          fetch('/api/longest'),
          fetch('/api/putting'),
          fetch('/api/nearest')
        ]);

        const [longestData, puttingData, nearestData] = await Promise.all([
          longestRes.json(),
          puttingRes.json(),
          nearestRes.json()
        ]);

        setRecordCounts({
          longest: longestData.length || 0,
          putting: puttingData.length || 0,
          nearest: nearestData.length || 0
        });
      } catch (error) {
        console.error('Failed to fetch record counts:', error);
      }
    };

    fetchRecordCounts();
  }, []);
  return (
    <div className="space-y-12">
      {/* 히어로 섹션 - 경신 브랜드 스타일 */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl overflow-hidden">
        <div className="relative px-8 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-5xl font-bold mb-6 text-white">
              2025 스크린린골프 대회
            </h1>
            <p className="text-base md:text-xl mb-8 text-blue-100">
              Kyungshin Golf Tournament - 5개 대회로 구성된 골프 대회
            </p>
            <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">실시간 대회 현황</h3>
                <p className="text-sm text-gray-700">Live Tournament Dashboard</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-lg md:text-2xl font-bold text-gray-900 mb-1">13</div>
                  <div className="text-xs md:text-sm font-medium text-gray-700">본부대항전 참가팀</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-lg md:text-2xl font-bold text-gray-900 mb-1">4</div>
                  <div className="text-xs md:text-sm font-medium text-gray-700">경영진 대항전 팀</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{recordCounts.longest}</div>
                  <div className="text-xs md:text-sm font-medium text-gray-700">롱기스트 기록</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{recordCounts.putting}</div>
                  <div className="text-xs md:text-sm font-medium text-gray-700">퍼팅 기록</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{recordCounts.nearest}</div>
                  <div className="text-xs md:text-sm font-medium text-gray-700">니어핀 기록</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 대회 종목 섹션 */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">대회 종목</h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            다양한 골프 경기로 구성된 대회에서 실력을 겨뤄보세요!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 본부별 토너먼트 */}
          <Link href="/tournament/department">
            <div className="group bg-white dark:bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 h-full">
              <div className="p-8 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">🏆</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">본부별 토너먼트</h3>
                <p className="text-sm md:text-base text-gray-600  mb-4 leading-relaxed flex-grow">
                  16강 토너먼트 형식으로 진행되는 본부 대항전입니다. 본부간 골프실력을 겨뤄보세요!
                </p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 mt-auto">
                  <span>브래킷 확인하기</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* 경영진 매치 */}
          <Link href="/tournament/executive">
            <div className="group bg-white dark:bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 h-full">
              <div className="p-8 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">👑</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900  mb-3">경영진 매치게임</h3>
                <p className="text-gray-600  mb-4 leading-relaxed flex-grow">
                  회사 경영진들의 골프 매치입니다. 경영진+팀장급+팀원급으로 이루어진 팀의 맞대결이 진행됩니다.
                </p>
                <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700 mt-auto">
                  <span>매치 결과 보기</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* 롱기스트 */}
          <Link href="/longest">
            <div className="group bg-white dark:bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 h-full">
              <div className="p-8 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900  mb-3">롱기스트 드라이브</h3>
                <p className="text-gray-600  mb-4 leading-relaxed flex-grow">
                  가장 긴 거리를 기록하는 드라이버 샷 경쟁입니다. 파워와 정확성이 관건입니다.
                </p>
                <div className="flex items-center text-green-600 font-medium group-hover:text-green-700 mt-auto">
                  <span>거리 순위 보기</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* 퍼팅게임 */}
          <Link href="/putting">
            <div className="group bg-white dark:bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 h-full">
              <div className="p-8 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900  mb-3">퍼팅 정확도</h3>
                <p className="text-gray-600  mb-4 leading-relaxed flex-grow">
                  19.74m 목표 지점에 정확히 맞추는 퍼팅 정확도 경쟁입니다. 단 골프 미경험자만 참여가 가능합니다.
                </p>
                <div className="flex items-center text-orange-600 font-medium group-hover:text-orange-700 mt-auto">
                  <span>정확도 차트 보기</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* 니어핀 */}
          <Link href="/nearest">
            <div className="group bg-white dark:bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 h-full">
              <div className="p-8 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">🎪</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900  mb-3">니어핀 챌린지</h3>
                <p className="text-gray-600  mb-4 leading-relaxed flex-grow">
                  51m 목표 지점에 최대한 근접하는 어프로치치 샷 정확도 경쟁입니다.
                </p>
                <div className="flex items-center text-red-600 font-medium group-hover:text-red-700 mt-auto">
                  <span>근접도 차트 보기</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* 관리자 */}
          <Link href="/admin">
            <div className="group bg-white dark:bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 h-full">
              <div className="p-8 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">⚙️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900  mb-3">관리자 대시보드</h3>
                <p className="text-gray-600  mb-4 leading-relaxed flex-grow">
                  참가자 등록, 결과 입력 및 대회 관리를 위한 관리자 전용 페이지입니다.
                </p>
                <div className="flex items-center text-gray-600 font-medium group-hover:text-gray-700 mt-auto">
                  <span>관리 페이지 이동</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>


      {/* 대회 사진 갤러리 */}
      <PhotoGallery />
    </div>
  );
}
