import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Mock: redireciona para Steam e retorna sucesso
  res.status(200).json({ message: 'Login Steam (mock). Integração real deve ser feita com passport-steam.' });
} 