import { NextApiRequest, NextApiResponse } from 'next';

const requests: Record<string, { count: number; last: number }> = {};
const WINDOW = 60 * 1000; // 1 minuto
const LIMIT = 60; // 60 req/min

export function rateLimit(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const now = Date.now();
    if (!requests[ip as string] || now - requests[ip as string].last > WINDOW) {
      requests[ip as string] = { count: 1, last: now };
    } else {
      requests[ip as string].count++;
      if (requests[ip as string].count > LIMIT) {
        return res.status(429).json({ error: 'Muitas requisições, tente novamente em instantes.' });
      }
    }
    return handler(req, res);
  };
} 