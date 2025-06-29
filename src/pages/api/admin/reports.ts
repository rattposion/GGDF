import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '../../../middlewares/auth';
import { withRole } from '../../../middlewares/role';

export default authenticate(withRole(['admin'], async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  // Mock: retorna lista vazia
  res.status(200).json({ reports: [] });
})); 