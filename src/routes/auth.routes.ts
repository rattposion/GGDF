import { Router } from 'express';
import { register, login, getMe, updateProfile, toggle2FA, changePassword, deleteAccount, uploadKYC, updatePix, linkSteam, linkDiscord, linkSocialAccount, unlinkSocialAccount } from '../controllers/auth.controller';
import passport from 'passport';
import { generateJWT } from '../steam';
import { authenticate } from '../middlewares/auth.middleware';
import { getUserReviews } from '../controllers/review.controller';
import { JWT_SECRET } from '../config';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

const router = Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());

router.post('/register', register);
router.post('/login', login);

// Login Steam
router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }));
router.get('/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => {
  // Gere o token JWT e envie para o frontend via query string
  const user = req.user as any;
  const token = generateJWT(user);
  // Redirecione para o frontend com o token
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`);
});

// Login Discord
router.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email'], failureRedirect: '/' }));
router.get('/discord/return', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
  const user = req.user as any;
  const token = generateJWT(user);
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`);
});

// Steam OAuth - salvar token em cookie
router.get('/auth/steam', (req, res, next) => {
  const { token } = req.query;
  if (token) {
    res.cookie('link_jwt', token, { httpOnly: true, sameSite: 'lax' });
  }
  next();
}, passport.authenticate('steam', { session: false }));

// Discord OAuth - salvar token em cookie
router.get('/auth/discord', (req, res, next) => {
  const { token } = req.query;
  if (token) {
    res.cookie('link_jwt', token, { httpOnly: true, sameSite: 'lax' });
  }
  next();
}, passport.authenticate('discord', { session: false }));

// Steam callback - associar SocialAccount ao userId do token
router.get('/auth/steam/return', passport.authenticate('steam', { session: false }), async (req, res) => {
  const token = req.cookies.link_jwt;
  res.clearCookie('link_jwt');
  if (!token) return res.redirect('http://localhost:5173/auth/link/steam/callback?error=notoken');
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.redirect('http://localhost:5173/auth/link/steam/callback?error=invalidtoken');
  }
  // Associe a conta social ao userId
  await prisma.socialAccount.upsert({
    where: { provider_providerId: { provider: 'steam', providerId: req.user.id } },
    update: { userId },
    create: { userId, provider: 'steam', providerId: req.user.id }
  });
  return res.redirect('http://localhost:5173/auth/link/steam/callback?success=1');
});

// Discord callback - associar SocialAccount ao userId do token
router.get('/auth/discord/return', passport.authenticate('discord', { session: false }), async (req, res) => {
  const token = req.cookies.link_jwt;
  res.clearCookie('link_jwt');
  if (!token) return res.redirect('http://localhost:5173/auth/link/discord/callback?error=notoken');
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.redirect('http://localhost:5173/auth/link/discord/callback?error=invalidtoken');
  }
  // Associe a conta social ao userId
  await prisma.socialAccount.upsert({
    where: { provider_providerId: { provider: 'discord', providerId: req.user.id } },
    update: { userId },
    create: { userId, provider: 'discord', providerId: req.user.id }
  });
  return res.redirect('http://localhost:5173/auth/link/discord/callback?success=1');
});

router.get('/users/me', authenticate, getMe);
router.put('/users/me', authenticate, updateProfile);
router.post('/users/me/2fa', authenticate, toggle2FA);
router.put('/users/me/password', authenticate, changePassword);
router.delete('/users/me', authenticate, deleteAccount);
router.post('/users/me/kyc', authenticate, uploadKYC);
router.put('/users/me/pix', authenticate, updatePix);
router.get('/users/me/reviews', authenticate, getUserReviews);

// Rotas de vinculação de contas externas
router.get('/link/steam', authenticate, linkSteam);
router.get('/link/discord', authenticate, linkDiscord);

// Rotas REST para vinculação/desvinculação genérica
router.post('/link/:provider', authenticate, linkSocialAccount);
router.delete('/unlink/:provider', authenticate, unlinkSocialAccount);

export default router; 
