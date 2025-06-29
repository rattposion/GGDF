import { NextApiRequest, NextApiResponse } from 'next';

export function withRole(roles: string[], handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    return handler(req, res);
  };
} 