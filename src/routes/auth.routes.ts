import { Router, Request, Response, NextFunction } from 'express';
import { register, login, getMe, updateProfile, toggle2FA, changePassword, deleteAccount, uploadKYC, updatePix } from '../controllers/auth.controller';
import passport from 'passport';
import { generateJWT } from '../steam';
import { authenticate } from '../middlewares/auth.middleware';
import { getUserReviews } from '../controllers/review.controller';

// Tipagem para sessões
declare module 'express-session' {
  interface SessionData {
    jwt?: string;
  }
}

const router = Router();

// Registro e login padrão
router.post('/register', register);
router.post('/login', login);

// 🔗 Login com Steam
router.get('/steam', (req: Request, res: Response, next: NextFunction) => {
  // Extrai e valida o token da query
  let token: string | undefined = undefined;

  if (typeof req.query.token === 'string') {
    token = req.query.token;
  } else if (Array.isArray(req.query.token) && typeof req.query.token[0] === 'string') {
    token = req.query.token[0];
  }

  // Salva na sessão se válido
  if (token) {
    req.session.jwt = token;
  }

  passport.authenticate('steam', { failureRedirect: '/' })(req, res, next);
});

router.get('/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), (req: Request, res: Response) => {
  const user = req.user as any; // use interface se quiser maior controle
  const token = generateJWT(user);
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`);
});

// 🔗 Login com Discord
router.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email'], failureRedirect: '/' }));

router.get('/discord/return', passport.authenticate('discord', { failureRedirect: '/' }), (req: Request, res: Response) => {
  const user = req.user as any;
  const token = generateJWT(user);
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`);
});

// 🧾 Rotas autenticadas de usuário
router.get('/users/me', authenticate, getMe);
router.put('/users/me', authenticate, updateProfile);
router.post('/users/me/2fa', authenticate, toggle2FA);
router.put('/users/me/password', authenticate, changePassword);
router.delete('/users/me', authenticate, deleteAccount);
router.post('/users/me/kyc', authenticate, uploadKYC);
router.put('/users/me/pix', authenticate, updatePix);
router.get('/users/me/reviews', authenticate, getUserReviews);

export default router;
