import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUserId } from '@/lib/user';

// DELETE - Ambient sesi sil (sadece kendi eklediği)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getOrCreateUserId();
    const { id } = await params;

    // Ses var mı ve kullanıcıya ait mi kontrol et
    const sound = await prisma.ambientSound.findUnique({
      where: { id },
    });

    if (!sound) {
      return NextResponse.json(
        { error: 'Ambient ses bulunamadı' },
        { status: 404 }
      );
    }

    if (sound.isDefault) {
      return NextResponse.json(
        { error: 'Default sesler silinemez' },
        { status: 403 }
      );
    }

    if (sound.userId !== userId) {
      return NextResponse.json(
        { error: 'Bu sesi silme yetkiniz yok' },
        { status: 403 }
      );
    }

    await prisma.ambientSound.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Silindi' });
  } catch (error) {
    console.error('Error deleting ambient sound:', error);
    return NextResponse.json(
      { error: 'Ambient ses silinemedi' },
      { status: 500 }
    );
  }
}
