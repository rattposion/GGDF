import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      return res.status(400).json({ error: 'Usuário ou e-mail já cadastrado.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hash }
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro ao registrar.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });
    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Senha incorreta.' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
}; 