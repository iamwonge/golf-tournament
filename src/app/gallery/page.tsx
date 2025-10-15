'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Photo {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos');
      const data = await response.json();
      console.log('Fetched photos data:', data);
      setPhotos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">대회 사진 갤러리</h1>
          <p className="text-gray-600">Tournament Photo Gallery</p>
        </div>
        
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-video bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Link 
            href="/"
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">대회 사진 갤러리</h1>
        </div>
        <p className="text-gray-600">
          총 {photos.length}장의 사진 • Tournament Photo Gallery
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">아직 업로드된 사진이 없습니다</h3>
          <p className="text-gray-600 mb-6">대회가 진행되면 멋진 사진들이 업로드될 예정입니다!</p>
          <Link 
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      ) : (
        <>
          {/* 사진 그리드 - 인스타그램 스타일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
            {photos.map((photo) => (
              <div 
                key={photo.id}
                className="group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-200">
                  <Image
                    src={photo.filePath}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Gallery image load error:', photo.filePath);
                    }}
                    onLoad={() => {
                      console.log('Gallery image loaded successfully:', photo.filePath);
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center p-4">
                      <h3 className="font-medium text-sm truncate">{photo.title}</h3>
                      <p className="text-xs text-gray-200 mt-1">
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 모달 */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative">
            <Image
              src={selectedPhoto.filePath}
              alt={selectedPhoto.title}
              width={800}
              height={600}
              className="object-contain max-h-[80vh] rounded-lg"
            />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
                <h3 className="text-white text-lg font-medium mb-2">{selectedPhoto.title}</h3>
                {selectedPhoto.description && (
                  <p className="text-gray-200 text-sm mb-2">{selectedPhoto.description}</p>
                )}
                <p className="text-gray-300 text-xs">
                  {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
