import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUserId } from '@/lib/user';

// GET - Kullanıcının kendi sesleri + default sesler
export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    
    const sounds = await prisma.ambientSound.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: userId }
        ]
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    });
    return NextResponse.json(sounds);
  } catch (error) {
    console.error('Error fetching ambient sounds:', error);
    return NextResponse.json(
      { error: 'Ambient sesler alınamadı' },
      { status: 500 }
    );
  }
}

// POST - Yeni ambient ses ekle (kullanıcıya özel)
export async function POST(request: NextRequest) {
  try {
    const userId = await getOrCreateUserId();
    const body = await request.json();
    const { name, youtubeUrl, videoId } = body;

    if (!name || !youtubeUrl || !videoId) {
      return NextResponse.json(
        { error: 'Name, youtubeUrl ve videoId gerekli' },
        { status: 400 }
      );
    }

    const sound = await prisma.ambientSound.create({
      data: {
        name,
        youtubeUrl,
        videoId,
        userId,
        isDefault: false,
      },
    });

    return NextResponse.json(sound, { status: 201 });
  } catch (error) {
    console.error('Error creating ambient sound:', error);
    return NextResponse.json(
      { error: 'Ambient ses eklenemedi' },
      { status: 500 }
    );
  }
}
