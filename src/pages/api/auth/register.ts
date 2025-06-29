import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Dados inválidos', details: parse.error.errors });
  const { email, password, username } = parse.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      nickname: username,
      accountType: 'comprador',
      verified: false,
      reputation: 0,
      status2FA: false,
      documentSent: false,
    },
  });
  // Mock envio de email de ativação
  // await sendActivationEmail(user.email, ...)
  res.status(201).json({ message: 'Usuário registrado. Verifique seu e-mail para ativação.', user: { id: user.id, email: user.email, nickname: user.nickname } });
} 