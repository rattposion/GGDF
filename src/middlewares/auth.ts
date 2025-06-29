import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export function authenticate(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      (req as any).user = decoded;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
} 