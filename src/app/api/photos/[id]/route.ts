import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';
import { isAdmin } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 관리자 권한 확인
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const photo = await prisma.photo.findUnique({
      where: { id: params.id }
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // 파일 삭제
    try {
      const filePath = path.join(process.cwd(), 'public', photo.filePath);
      await unlink(filePath);
    } catch (fileError) {
      console.error('File deletion error:', fileError);
    }

    // 데이터베이스에서 삭제
    await prisma.photo.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 관리자 권한 확인
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { title, description } = await request.json();

    const photo = await prisma.photo.update({
      where: { id: params.id },
      data: {
        title,
        description
      }
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}

