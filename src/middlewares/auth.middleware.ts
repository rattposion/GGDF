import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  console.log('[auth.middleware] Início do middleware de autenticação');
  const authHeader = req.headers.authorization;
  console.log('[auth.middleware] Authorization header:', authHeader);
  if (!authHeader) {
    console.log('[auth.middleware] Token não fornecido');
    res.status(401).json({ error: 'Token não fornecido.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  console.log('[auth.middleware] Token extraído:', token);
  if (!token) {
    console.log('[auth.middleware] Token inválido');
    res.status(401).json({ error: 'Token inválido.' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log('[auth.middleware] Token decodificado:', decoded);
    (req as any).userId = decoded.id;
    next();
  } catch (err) {
    console.log('[auth.middleware] Erro ao verificar token:', err);
    res.status(401).json({ error: 'Token inválido.' });
  }
} 