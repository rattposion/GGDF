import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  // Mock: simula pagamento Pix
  res.status(200).json({ message: 'Pagamento Pix simulado (mock).' });
} 