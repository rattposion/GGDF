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
  let user = await prisma.user.findUnique({ where: { steamId: profile.id } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: profile.displayName,
        steamId: profile.id,
        email: `${profile.id}@steamcommunity.com`,
        password: 'social_login',
        avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value,
        isVerified: true,
      }
    });
  }
  return done(null, user);
}));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:4000/api/auth/discord/return',
  scope: ['identify', 'email']
}, async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
  let user = await prisma.user.findUnique({ where: { discordId: profile.id } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: profile.username,
        discordId: profile.id,
        email: profile.email || `${profile.id}@discord.com`,
        password: 'social_login',
        avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
        isVerified: true,
      }
    });
  }
  return done(null, user);
}));

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => done(null, user.id));
passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

export function generateJWT(user: any) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
} 
