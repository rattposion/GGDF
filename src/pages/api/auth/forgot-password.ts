import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail obrigatório' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  // Mock envio de email com token
  // await sendResetEmail(user.email, token)
  res.status(200).json({ message: 'E-mail de recuperação enviado (mock).', token });
} 