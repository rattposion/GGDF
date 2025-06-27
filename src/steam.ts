import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import { Strategy as DiscordStrategy } from 'passport-discord';
import prisma from './prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

console.log('STEAM_API_KEY:', process.env.STEAM_API_KEY);
console.log('STEAM_RETURN_URL:', process.env.STEAM_RETURN_URL);
console.log('STEAM_REALM:', process.env.STEAM_REALM);

passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:4000/api/auth/steam/return',
  realm: process.env.STEAM_REALM || 'http://localhost:4000/',
  apiKey: process.env.STEAM_API_KEY || 'SUA_STEAM_API_KEY'
}, async (identifier: string, profile: any, done: (err: any, user?: any) => void) => {
  try {
    const email = `${profile.id}@steamcommunity.com`;
    let user = await prisma.user.findUnique({ where: { email } });
    let avatarUrl = profile.photos?.[2]?.value || profile.photos?.[0]?.value || '/steam.svg';
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: profile.displayName,
          email,
          password: 'social_login',
          avatarUrl,
          isVerified: true,
        }
      });
    } else if (user.avatarUrl !== avatarUrl) {
      user = await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });
    }
    // Vincula ou atualiza SocialAccount
    await prisma.socialAccount.upsert({
      where: { provider_providerId: { provider: 'steam', providerId: profile.id } },
      update: { userId: user.id },
      create: {
        userId: user.id,
        provider: 'steam',
        providerId: profile.id,
      }
    });
    return done(null, { id: user.id });
  } catch (err) {
    console.error('Erro no login Steam:', err);
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
    const email = profile.email || `${profile.id}@discord.com`;
    let user = await prisma.user.findUnique({ where: { email } });
    let avatarUrl = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : '/discord.svg';
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: profile.username,
          email,
          password: 'social_login',
          avatarUrl,
          isVerified: true,
        }
      });
    } else if (user.avatarUrl !== avatarUrl) {
      user = await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });
    }
    // Vincula ou atualiza SocialAccount
    await prisma.socialAccount.upsert({
      where: { provider_providerId: { provider: 'discord', providerId: profile.id } },
      update: { userId: user.id },
      create: {
        userId: user.id,
        provider: 'discord',
        providerId: profile.id,
        accessToken,
        refreshToken
      }
    });
    return done(null, { id: user.id });
  } catch (err) {
    console.error('Erro no login Discord:', err);
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
