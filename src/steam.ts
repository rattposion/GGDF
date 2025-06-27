import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import { Strategy as DiscordStrategy } from 'passport-discord';
import prisma from './prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:4000/api/auth/steam/return',
  realm: process.env.STEAM_REALM || 'http://localhost:4000/',
  apiKey: process.env.STEAM_API_KEY || 'SUA_STEAM_API_KEY'
}, async (identifier: string, profile: any, done: (err: any, user?: any) => void) => {
  try {
    console.log('[SteamStrategy] Início do login social Steam', { identifier, steamId: profile.id });
    // Verifica se já existe vínculo para essa Steam
    const existing = await prisma.socialLink.findUnique({ where: { provider_providerId: { provider: 'steam', providerId: profile.id } } });
    if (existing) {
      // Busca o usuário vinculado
      const user = await prisma.user.findUnique({ where: { id: existing.userId } });
      console.log('[SteamStrategy] Usuário já vinculado encontrado:', user?.id);
      return done(null, user);
    }
    // Recupera o token JWT da sessão
    const token = profile.req?.session?.jwt;
    if (!token) {
      console.error('[SteamStrategy] Token de autenticação não encontrado na sessão');
      return done(new Error('Token de autenticação não encontrado. Faça login com Discord antes de vincular Steam.'));
    }
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (typeof decoded === 'string') {
        userId = decoded;
      } else if (typeof decoded === 'object' && decoded && 'id' in decoded) {
        userId = (decoded as any).id;
      } else {
        console.error('[SteamStrategy] Token JWT inválido:', decoded);
        return done(new Error('Token inválido. Faça login novamente.'));
      }
    } catch (err) {
      console.error('[SteamStrategy] Erro ao decodificar token JWT:', err);
      return done(new Error('Token inválido. Faça login novamente.'));
    }
    // Busca ou cria o usuário na tabela User
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.log('[SteamStrategy] Usuário não encontrado, criando novo usuário:', userId);
      user = await prisma.user.create({
        data: {
          id: userId,
          username: `steam_${profile.id}`,
          email: `${profile.id}@steam.local`,
          password: await bcrypt.hash(Math.random().toString(36), 10),
          steamId: profile.id,
        }
      });
      console.log('[SteamStrategy] Novo usuário criado:', user.id);
    } else if (!user.steamId) {
      await prisma.user.update({ where: { id: userId }, data: { steamId: profile.id } });
      console.log('[SteamStrategy] steamId atualizado para usuário existente:', userId);
    }
    // Verifica se já existe vínculo para esse Discord
    const existingDiscord = await prisma.socialLink.findUnique({ where: { provider_providerId: { provider: 'discord', providerId: userId } } });
    if (existingDiscord) {
      console.error('[SteamStrategy] Discord já vinculado a outro usuário:', userId);
      return done(new Error('Este Discord já está vinculado a uma conta Steam.'));
    }
    // Cria o vínculo
    await prisma.socialLink.create({
      data: {
        userId: user.id,
        provider: 'steam',
        providerId: profile.id
      }
    });
    console.log('[SteamStrategy] Vínculo Steam criado com sucesso para usuário:', user.id);
    // Opcional: atualizar avatar/nome do usuário, se desejar
    return done(null, user);
  } catch (err: any) {
    console.error('[SteamStrategy] Erro inesperado no login social:', err);
    if (err.code === 'P2021' || (err.message && err.message.includes('does not exist'))) {
      return done(new Error('Erro interno: tabela de vínculo social não encontrada. Contate o suporte.'));
    }
    return done(err);
  }
}));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:4000/api/auth/discord/return',
  scope: ['identify', 'email']
}, async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
  try {
    // Verifica se já existe vínculo para esse Discord
    const existing = await prisma.socialLink.findUnique({ where: { provider_providerId: { provider: 'discord', providerId: profile.id } } });
    if (existing) {
      return done(new Error('Esta conta Discord já está vinculada a uma conta Steam.'));
    }
    // Aqui você deve obter o steamId do usuário logado, se desejar permitir o fluxo inverso
    // Exemplo: const steamId = profile.req?.user?.steamId;
    // Se quiser permitir criar vínculo só pelo Discord, pode criar o vínculo vazio e permitir completar depois
    // await prisma.socialLink.create({ data: { userId: profile.id, provider: 'discord', providerId: null } });
    // ...
    // Para este exemplo, só permite criar vínculo se já houver Steam logada
    return done(null, { id: profile.id, username: profile.username, discordUsername: profile.username, discordAvatar: profile.avatar });
  } catch (err: any) {
    if (err.code === 'P2021' || (err.message && err.message.includes('does not exist'))) {
      return done(new Error('Erro interno: tabela de vínculo social não encontrada. Contate o suporte.'));
    }
    return done(err);
  }
}));

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => done(null, user.id));
passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

export function generateJWT(user: any) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
} 
