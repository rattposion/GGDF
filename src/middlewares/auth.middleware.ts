import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, isAdmin?: boolean };
    (req as any).userId = decoded.id;
    (req as any).isAdmin = decoded.isAdmin || false;
    // Buscar usuário completo no banco e popular req.user
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
} 