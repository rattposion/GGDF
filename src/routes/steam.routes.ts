import { Router } from 'express';
import axios from 'axios';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/inventory', authenticate, async (req, res) => {
  const user = (req as any).user;
  const steamId = user.steamId;
  if (!steamId) return res.status(400).json({ error: 'Usuário não vinculado ao Steam.' });

  const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;
  const { data } = await axios.get(url);
  res.json(data);
});

export default router; 