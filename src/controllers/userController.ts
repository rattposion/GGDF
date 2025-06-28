import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

function getUserIdFromToken(req: Request): number | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    const payload = require('../utils/jwt').verifyToken(token) as any;
    return payload.userId;
  } catch {
    return null;
  }
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) }, select: { id: true, email: true, name: true, createdAt: true } });
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = getUserIdFromToken(req);
  if (!userId || userId !== Number(id)) {
    res.status(403).json({ error: 'Acesso negado.' });
    return;
  }
  const { name, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = getUserIdFromToken(req);
  if (!userId || userId !== Number(id)) {
    res.status(403).json({ error: 'Acesso negado.' });
    return;
  }
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'Usuário deletado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
};

export const updateSteamId = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { steamId } = req.body;
  if (!userId || !steamId) {
    res.status(400).json({ error: 'Dados obrigatórios não informados.' });
    return;
  }
  try {
    const user = await prisma.user.update({ where: { id: userId }, data: { steamId } });
    res.json({ message: 'SteamID atualizado com sucesso.', user });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar SteamID.' });
  }
}; 