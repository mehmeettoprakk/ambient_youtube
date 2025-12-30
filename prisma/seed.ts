import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Default ambient sesler
  const defaultSounds = [
    {
      name: 'Yağmur Sesi',
      youtubeUrl: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
      videoId: 'mPZkdNFkNps',
      isDefault: true,
    },
    {
      name: 'Orman Sesleri',
      youtubeUrl: 'https://www.youtube.com/watch?v=xNN7iTA57jM',
      videoId: 'xNN7iTA57jM',
      isDefault: true,
    },
    {
      name: 'Dalga Sesi',
      youtubeUrl: 'https://www.youtube.com/watch?v=WHPEKLQID4U',
      videoId: 'WHPEKLQID4U',
      isDefault: true,
    },
  ];

  for (const sound of defaultSounds) {
    // Önce kontrol et, varsa atla
    const existing = await prisma.ambientSound.findFirst({
      where: { videoId: sound.videoId },
    });

    if (!existing) {
      await prisma.ambientSound.create({
        data: sound,
      });
      console.log(`✅ Added: ${sound.name}`);
    } else {
      console.log(`⏭️  Skipped: ${sound.name} (already exists)`);
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
