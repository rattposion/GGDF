import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'segredo';

export function generateToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
} 