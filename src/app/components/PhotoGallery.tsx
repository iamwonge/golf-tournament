'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Photo {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  createdAt: string;
}

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos');
      const data = await response.json();
      setPhotos(Array.isArray(data) ? data.slice(0, 10) : []); // 최신 10개만 표시
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">대회 사진</h2>
          <p className="text-gray-600 mt-1">Tournament Photo Gallery</p>
        </div>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-video bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">대회 사진</h2>
          <p className="text-gray-600 mt-1">Tournament Photo Gallery</p>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">아직 업로드된 사진이 없습니다</h3>
          <p className="text-gray-600">대회가 진행되면 멋진 사진들이 업로드될 예정입니다!</p>
        </div>
      </div>
    );
  }

  // 6:4 비율로 배치 (큰 사진 6개, 작은 사진 4개)
  const mainPhotos = photos.slice(0, 6);
  const subPhotos = photos.slice(6, 10);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">대회 사진</h2>
            <p className="text-gray-600 mt-1">Tournament Photo Gallery</p>
          </div>
          <Link 
            href="/gallery"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            더보기
          </Link>
        </div>
      </div>
      
      <div className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {/* 모든 사진들을 3열 그리드로 표시 - 인스타그램 스타일 */}
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="relative group cursor-pointer overflow-hidden"
            >
              <div className="aspect-[4/5] relative bg-gray-200">
                <img
                  src={photo.filePath}
                  alt={photo.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                  <div className="text-white p-4 text-center w-full">
                    <h4 className="font-medium text-sm truncate">{photo.title}</h4>
                    {photo.description && (
                      <p className="text-xs text-gray-200 mt-1 line-clamp-2">{photo.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {photos.length > 10 && (
          <div className="mt-6 text-center">
            <Link 
              href="/gallery"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>더 많은 사진 보기</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
