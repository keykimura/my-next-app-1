import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // テストルームの作成
  const room = await prisma.room.create({
    data: {
      name: 'テストルーム',
      genre: '音楽',
      maxMembers: 10,
      youtubeLinks: {
        create: [
          {
            videoId: 'dQw4w9WgXcQ',
            title: 'Rick Astley - Never Gonna Give You Up'
          }
        ]
      }
    }
  });

  console.log('Created test room:', room);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
