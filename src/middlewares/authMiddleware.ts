import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extensão do tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number };
    }
  }
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token) as { userId: number };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
} 