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

// Retorna o usuário autenticado
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    // Retornar apenas os campos públicos
    const { id, username, email, avatar, steamId, balance, rating, totalSales, joinDate, isVerified, isBanned, isAdmin } = user;
    res.json({ id, username, email, avatar, steamId, balance, rating, totalSales, joinDate, isVerified, isBanned, isAdmin });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
};

// Atualizar perfil do usuário
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { username, email, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { username, email, avatar }
    });
    res.json({ id: user.id, username: user.username, email: user.email, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
};

// Ativar/desativar 2FA (mock)
export const toggle2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { enabled } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { twofa: enabled }
    });
    res.json({ twofa: user.twofa });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar 2FA.' });
  }
};

// Alterar senha
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Senha atual incorreta.' });
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hash } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
};

// Deletar conta
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar conta.' });
  }
};

// Upload de documento (KYC) - mock
export const uploadKYC = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    // Aqui você pode salvar o arquivo e atualizar o campo kyc/documento
    await prisma.user.update({ where: { id: userId }, data: { kyc: true } });
    res.json({ kyc: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar documento.' });
  }
};

// Atualizar chave Pix
export const updatePix = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { pix } = req.body;
    const user = await prisma.user.update({ where: { id: userId }, data: { pix } });
    res.json({ pix: user.pix });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar chave Pix.' });
  }
}; 