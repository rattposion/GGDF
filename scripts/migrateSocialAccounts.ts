import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrate() {
  const users = await prisma.user.findMany();
  let count = 0;
  for (const user of users) {
    if (user.steamId) {
      await prisma.socialAccount.upsert({
        where: { provider_providerId: { provider: 'steam', providerId: user.steamId } },
        update: { userId: user.id },
        create: { userId: user.id, provider: 'steam', providerId: user.steamId }
      });
      count++;
    }
    if (user.discordId) {
      await prisma.socialAccount.upsert({
        where: { provider_providerId: { provider: 'discord', providerId: user.discordId } },
        update: { userId: user.id },
        create: { userId: user.id, provider: 'discord', providerId: user.discordId }
      });
      count++;
    }
  }
  console.log(`Migração concluída! ${count} contas sociais migradas.`);
  process.exit();
}

migrate(); 