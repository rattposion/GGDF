import { NextApiRequest, NextApiResponse } from 'next';
import xss from 'xss';

function sanitize(obj: any): any {
  if (typeof obj === 'string') return xss(obj);
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitize(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

export function xssSanitizer(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    return handler(req, res);
  };
} 