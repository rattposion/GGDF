import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import { Strategy as DiscordStrategy } from 'passport-discord';
import prisma from './prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:4000/api/auth/steam/return',
  realm: process.env.STEAM_REALM || 'http://localhost:4000/',
  apiKey: process.env.STEAM_API_KEY || 'SUA_STEAM_API_KEY'
}, async (identifier: string, profile: any, done: (err: any, user?: any) => void) => {
  // Verifica se já existe vínculo para essa Steam
  const existing = await prisma.contaVinculada.findUnique({ where: { steamId: profile.id } });
  if (existing) {
    return done(new Error('Esta conta Steam já está vinculada a outro usuário Discord.'));
  }
  // Aqui você deve obter o usuário logado (ex: pelo session/cookie)
  // Exemplo: const userId = profile.req?.user?.id;
  const userId = profile.req?.user?.id;
  if (!userId) {
    return done(new Error('É necessário estar logado com Discord para vincular uma conta Steam.'));
  }
  // Verifica se já existe vínculo para esse Discord
  const existingDiscord = await prisma.contaVinculada.findUnique({ where: { discordId: userId } });
  if (existingDiscord) {
    return done(new Error('Este Discord já está vinculado a uma conta Steam.'));
  }
  // Cria o vínculo
  await prisma.contaVinculada.create({
    data: {
      discordId: userId,
      steamId: profile.id
    }
  });
  // Opcional: atualizar avatar/nome do usuário, se desejar
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return done(null, user);
}));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:4000/api/auth/discord/return',
  scope: ['identify', 'email']
}, async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
  // Verifica se já existe vínculo para esse Discord
  const existing = await prisma.contaVinculada.findUnique({ where: { discordId: profile.id } });
  if (existing) {
    return done(new Error('Esta conta Discord já está vinculada a uma conta Steam.'));
  }
  // Aqui você deve obter o steamId do usuário logado, se desejar permitir o fluxo inverso
  // Exemplo: const steamId = profile.req?.user?.steamId;
  // Se quiser permitir criar vínculo só pelo Discord, pode criar o vínculo vazio e permitir completar depois
  // await prisma.contaVinculada.create({ data: { discordId: profile.id, steamId: null } });
  // ...
  // Para este exemplo, só permite criar vínculo se já houver Steam logada
  return done(null, { id: profile.id, username: profile.username, discordUsername: profile.username, discordAvatar: profile.avatar });
}));

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => done(null, user.id));
passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

export function generateJWT(user: any) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
} 