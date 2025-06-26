import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, isAdmin?: boolean };
    (req as any).userId = decoded.id;
    (req as any).isAdmin = decoded.isAdmin || false;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
} 