import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import passport from 'passport';
import axios from 'axios';

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
    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
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
    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
};

// Retorna o usuário autenticado
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        steamId: true,
        discordId: true,
        balance: true,
        rating: true,
        totalSales: true,
        createdAt: true,
        isVerified: true,
        isBanned: true,
        isAdmin: true,
        socialAccounts: {
          select: {
            id: true,
            provider: true,
            providerId: true,
            createdAt: true
          }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
};

// Atualizar perfil do usuário
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { username, email, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { username, email, avatarUrl }
    });
    res.json({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl });
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

// Desvincular Steam
export const unlinkSteam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    // Não permitir desvincular se não houver outro método de login
    const hasOtherLogin = (user.email && user.password !== 'social_login') || user.discordId;
    if (!hasOtherLogin) {
      return res.status(400).json({ error: 'Não é possível desvincular a Steam. Você precisa ter outro método de login (email/senha ou Discord) vinculado.' });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { steamId: null }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao desvincular Steam.' });
  }
};

// Desvincular Discord
export const unlinkDiscord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    // Não permitir desvincular se não houver outro método de login
    const hasOtherLogin = (user.email && user.password !== 'social_login') || user.steamId;
    if (!hasOtherLogin) {
      return res.status(400).json({ error: 'Não é possível desvincular o Discord. Você precisa ter outro método de login (email/senha ou Steam) vinculado.' });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { discordId: null }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao desvincular Discord.' });
  }
};

// Inicia OAuth Steam para vinculação
export const linkSteam = passport.authenticate('steam', { scope: ['identify'], session: false });

// Inicia OAuth Discord para vinculação
export const linkDiscord = passport.authenticate('discord', { scope: ['identify', 'email'], session: false });

// Callback de vinculação Steam
export const linkSteamCallback = [
  passport.authenticate('steam', { failureRedirect: '/profile?error=steam', session: false }),
  async (req: Request, res: Response) => {
    const steamId = (req.user as any)?.steamId;
    const userId = (req as any).userId;
    if (!userId || !steamId) return res.status(401).json({ error: 'Não autenticado.' });
    // Verifica se steamId já está em uso
    const existing = await prisma.user.findUnique({ where: { steamId } });
    if (existing && existing.id !== userId) {
      return res.redirect('/profile?error=steam_in_use');
    }
    // Atualiza usuário logado
    await prisma.user.update({ where: { id: userId }, data: { steamId } });
    res.redirect('/profile?success=steam_linked');
  }
];

// Callback de vinculação Discord
export const linkDiscordCallback = [
  passport.authenticate('discord', { failureRedirect: '/profile?error=discord', session: false }),
  async (req: Request, res: Response) => {
    const discordId = (req.user as any)?.discordId;
    const userId = (req as any).userId;
    if (!userId || !discordId) return res.status(401).json({ error: 'Não autenticado.' });
    // Verifica se discordId já está em uso
    const existing = await prisma.user.findUnique({ where: { discordId } });
    if (existing && existing.id !== userId) {
      return res.redirect('/profile?error=discord_in_use');
    }
    // Atualiza usuário logado
    await prisma.user.update({ where: { id: userId }, data: { discordId } });
    res.redirect('/profile?success=discord_linked');
  }
];

// Função utilitária para checar se perfil Steam é público
async function isSteamProfilePublic(steamId: string): Promise<boolean> {
  const apiKey = process.env.STEAM_API_KEY;
  const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`;
  const { data } = await axios.get(url);
  const player = data.response.players[0];
  return player && player.communityvisibilitystate === 3;
}

// Vincular conta social (Steam, Discord, etc)
export const linkSocialAccount = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { provider, providerId, accessToken, refreshToken } = req.body;
  if (!provider || !providerId) {
    return res.status(400).json({ error: 'Provedor e ID do provedor são obrigatórios.' });
  }
  // Validação de perfil público Steam
  if (provider === 'steam') {
    const isPublic = await isSteamProfilePublic(providerId);
    if (!isPublic) {
      return res.status(400).json({ error: 'Seu perfil Steam está privado. Torne-o público para vincular.' });
    }
  }
  // Verificar duplicidade
  const existing = await prisma.socialAccount.findUnique({ where: { provider_providerId: { provider, providerId } } });
  if (existing && existing.userId !== userId) {
    await prisma.linkLog.create({ data: { userId, provider, providerId, action: 'fail', ip: req.ip, userAgent: req.headers['user-agent'] } });
    return res.status(400).json({ error: 'Esta conta já está vinculada a outro usuário.' });
  }
  // Criar ou atualizar SocialAccount
  await prisma.socialAccount.upsert({
    where: { provider_providerId: { provider, providerId } },
    update: { userId, accessToken, refreshToken },
    create: { userId, provider, providerId, accessToken, refreshToken }
  });
  await prisma.linkLog.create({ data: { userId, provider, providerId, action: 'link', ip: req.ip, userAgent: req.headers['user-agent'] } });
  res.json({ success: true });
};

// Desvincular conta social
export const unlinkSocialAccount = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { provider } = req.params;
  // Contas sociais do usuário
  const accounts = await prisma.socialAccount.findMany({ where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  // Verificar fallback: precisa ter pelo menos outro método de login (social ou email/senha)
  const hasOtherLogin = (user?.email && user?.password !== 'social_login') || accounts.length > 1;
  if (!hasOtherLogin) {
    await prisma.linkLog.create({ data: { userId, provider, providerId: '', action: 'fail', ip: req.ip, userAgent: req.headers['user-agent'] } });
    return res.status(400).json({ error: 'Não é possível desvincular. Você precisa ter outro método de login ativo.' });
  }
  // Remover SocialAccount
  await prisma.socialAccount.deleteMany({ where: { userId, provider } });
  await prisma.linkLog.create({ data: { userId, provider, providerId: '', action: 'unlink', ip: req.ip, userAgent: req.headers['user-agent'] } });
  res.json({ success: true });
}; 