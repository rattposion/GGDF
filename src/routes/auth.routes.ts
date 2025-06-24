import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import passport from 'passport';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Login Steam
router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }));
router.get('/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => {
  // Gere o token JWT e envie para o frontend (ajuste conforme seu fluxo)
  res.redirect('/'); // ajuste para seu frontend
});

export default router; 