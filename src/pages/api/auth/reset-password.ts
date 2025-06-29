import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token e nova senha obrigatórios' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: decoded.id }, data: { password: hash } });
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    res.status(400).json({ error: 'Token inválido ou expirado.' });
  }
} 