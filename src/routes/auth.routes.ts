import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import passport from 'passport';
import { generateJWT } from '../steam';
import { authenticate } from '../middlewares/auth.middleware';
import prisma from '../prisma';

const router = Router();

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

router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ id: user.id, username: user.username, email: user.email, avatar: user.avatar, steamId: user.steamId, discordId: user.discordId });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});

export default router; 