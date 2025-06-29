import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return res.status(401).json({ error: 'Credenciais inválidas' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.accountType }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.status(200).json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, accountType: user.accountType } });
} 