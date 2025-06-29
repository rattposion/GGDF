import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Usuário não informado' });
  // Mock: habilita 2FA (na real, deveria gerar secret TOTP e QRCode)
  await prisma.user.update({ where: { id: userId }, data: { status2FA: true } });
  res.status(200).json({ message: '2FA habilitado (mock).' });
} 