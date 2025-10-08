import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
// Sharp 모듈을 동적으로 import하여 Vercel 배포 문제 해결
import { isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // 관리자 권한 확인
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // 모든 사진 정보 가져오기
    const photos = await prisma.photo.findMany();
    
    // 파일들 삭제
    const { unlink } = await import('fs/promises');
    for (const photo of photos) {
      try {
        const filePath = path.join(process.cwd(), 'public', photo.filePath);
        await unlink(filePath);
      } catch (fileError) {
        console.error(`File deletion error for ${photo.filePath}:`, fileError);
      }
    }
    
    // 데이터베이스에서 모든 사진 삭제
    const result = await prisma.photo.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      deletedCount: result.count,
      message: `${result.count}개의 사진이 삭제되었습니다.`
    });
  } catch (error) {
    console.error('Delete all photos error:', error);
    return NextResponse.json({ error: 'Failed to delete all photos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // 관리자 권한 확인
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    
    console.log('Upload attempt:', { 
      hasFile: !!file, 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type,
      title 
    });
    
    if (!file) {
      console.log('No file in formData');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 파일 검증 (HEIC 파일 지원 추가)
    const allowedTypes = ['image/', 'application/octet-stream']; // HEIC는 octet-stream으로 인식됨
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    const isValidExtension = allowedExtensions.includes(fileExtension);
    
    if (!isValidType && !isValidExtension) {
      console.log('Invalid file type:', { type: file.type, extension: fileExtension });
      return NextResponse.json({ error: 'Only image files are allowed (JPG, PNG, GIF, WebP, HEIC)' }, { status: 400 });
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // 업로드 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos');
    await mkdir(uploadDir, { recursive: true });

    // 고유 파일명 생성
    const timestamp = Date.now();
    const originalExtension = path.extname(file.name).toLowerCase();
    const isHeic = ['.heic', '.heif'].includes(originalExtension);
    
    // HEIC 파일은 JPEG로 변환
    const outputExtension = isHeic ? '.jpg' : originalExtension;
    const fileName = `${timestamp}-${path.basename(file.name, originalExtension)}${outputExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const publicPath = `/uploads/photos/${fileName}`;

    // 파일 저장 및 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    if (isHeic) {
      try {
        // HEIC를 JPEG로 변환 (Sharp 동적 import)
        const sharp = (await import('sharp')).default;
        const convertedBuffer = await sharp(buffer)
          .jpeg({ quality: 85 })
          .toBuffer();
        await writeFile(filePath, convertedBuffer);
      } catch (error) {
        console.error('Sharp module error:', error);
        // Sharp 실패 시 원본 파일 저장
        await writeFile(filePath, buffer);
      }
    } else {
      // 일반 이미지는 그대로 저장
      await writeFile(filePath, buffer);
    }

    // 데이터베이스에 저장
    const photo = await prisma.photo.create({
      data: {
        title: title || file.name,
        description: description || null,
        fileName,
        filePath: publicPath,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: 'admin' // TODO: 실제 사용자 정보로 변경
      }
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
