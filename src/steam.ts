import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import prisma from './prisma';

passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:4000/api/auth/steam/return',
  realm: process.env.STEAM_REALM || 'http://localhost:4000/',
  apiKey: process.env.STEAM_API_KEY || 'SUA_STEAM_API_KEY'
}, async (identifier, profile, done) => {
  let user = await prisma.user.findUnique({ where: { steamId: profile.id } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: profile.displayName,
        steamId: profile.id,
        email: `${profile.id}@steamcommunity.com`,
        password: '',
        avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value,
        isVerified: true,
      }
    });
  }
  return done(null, user);
}));

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
}); 