'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos');
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      try {
        const response = await fetch('/api/photos', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          await fetchPhotos();
        } else {
          const errorData = await response.json();
          console.error('Upload failed:', errorData);
          alert(`업로드 실패: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('업로드 중 오류가 발생했습니다.');
      }
    }
    
    setUploading(false);
    event.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPhotos();
        alert('사진이 삭제되었습니다.');
      } else {
        const errorData = await response.json();
        alert(`삭제 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('모든 사진을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      const response = await fetch('/api/photos', {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPhotos();
        alert('모든 사진이 삭제되었습니다.');
      } else {
        const errorData = await response.json();
        alert(`삭제 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Delete all failed:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = async (photo: Photo, newTitle: string, newDescription: string) => {
    try {
      const response = await fetch(`/api/photos/${photo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
        }),
      });

      if (response.ok) {
        await fetchPhotos();
        setEditingPhoto(null);
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">사진 업로드</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            onChange={handleFileUpload}
            className="hidden"
            id="photo-upload"
            disabled={uploading}
          />
          <label
            htmlFor="photo-upload"
            className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
          >
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-lg font-medium">
                {uploading ? '업로드 중...' : '사진을 선택하거나 드래그하세요'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                JPG, PNG, GIF, WebP, HEIC 파일 (최대 10MB)
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">업로드된 사진 ({photos.length}개)</h3>
          {photos.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
            >
              전체 삭제
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="border rounded-lg overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={photo.filePath}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              
              <div className="p-4">
                {editingPhoto?.id === photo.id ? (
                  <EditForm
                    photo={photo}
                    onSave={handleEdit}
                    onCancel={() => setEditingPhoto(null)}
                  />
                ) : (
                  <>
                    <h4 className="font-medium truncate">{photo.title}</h4>
                    {photo.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-400">
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingPhoto(photo)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          편집
                        </button>
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditForm({ 
  photo, 
  onSave, 
  onCancel 
}: { 
  photo: Photo; 
  onSave: (photo: Photo, title: string, description: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(photo.title);
  const [description, setDescription] = useState(photo.description || '');

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 border rounded-md text-sm"
        placeholder="제목"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border rounded-md text-sm"
        placeholder="설명"
        rows={2}
      />
      <div className="flex space-x-2">
        <button
          onClick={() => onSave(photo, title, description)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          저장
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
        >
          취소
        </button>
      </div>
    </div>
  );
}
