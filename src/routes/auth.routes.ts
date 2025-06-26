import { Router } from 'express';
import { register, login, getMe, updateProfile, toggle2FA, changePassword, deleteAccount, uploadKYC, updatePix } from '../controllers/auth.controller';
import passport from 'passport';
import { generateJWT } from '../steam';
import { authenticate } from '../middlewares/auth.middleware';
import { getUserReviews } from '../controllers/review.controller';

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

router.get('/users/me', authenticate, getMe);
router.put('/users/me', authenticate, updateProfile);
router.post('/users/me/2fa', authenticate, toggle2FA);
router.put('/users/me/password', authenticate, changePassword);
router.delete('/users/me', authenticate, deleteAccount);
router.post('/users/me/kyc', authenticate, uploadKYC);
router.put('/users/me/pix', authenticate, updatePix);
router.get('/users/me/reviews', authenticate, getUserReviews);

export default router; 