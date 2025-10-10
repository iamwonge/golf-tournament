import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    // 데이터베이스에서 모든 사진 삭제 (Base64 데이터이므로 파일 삭제 불필요)
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

    // 파일 검증
    const allowedTypes = ['image/'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    const isValidExtension = allowedExtensions.includes(fileExtension);
    
    if (!isValidType && !isValidExtension) {
      console.log('Invalid file type:', { type: file.type, extension: fileExtension });
      return NextResponse.json({ error: 'Only image files are allowed (JPG, PNG, GIF, WebP)' }, { status: 400 });
    }

    // 파일 크기 제한 (5MB - Vercel 제한 고려)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Vercel에서는 파일을 직접 저장할 수 없으므로 Base64로 변환하여 데이터베이스에 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // 데이터베이스에 저장 (filePath에 data URL 저장)
    const photo = await prisma.photo.create({
      data: {
        title: title || file.name,
        description: description || null,
        fileName: file.name,
        filePath: dataUrl, // Base64 데이터 URL로 저장
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: 'admin'
      }
    });

    // 응답에서는 Base64 데이터 제외하고 메타데이터만 반환
    const { filePath, ...photoMeta } = photo;
    
    return NextResponse.json({
      ...photoMeta,
      hasImage: true
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
