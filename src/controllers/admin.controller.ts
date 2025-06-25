import { Request, Response } from 'express';
import prisma from '../prisma';

// Listar todos os usuários
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

// Banir/desbanir usuário
export const banUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    const user = await prisma.user.update({ where: { id }, data: { isBanned } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao banir usuário.' });
  }
};

// Listar todos os produtos
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ include: { seller: true, category: true, subcategory: true } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
};

// Aprovar/remover anúncio
export const setProductActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const product = await prisma.product.update({ where: { id }, data: { isActive } });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar anúncio.' });
  }
};

// Listar todos os pedidos
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({ include: { product: true, buyer: true, seller: true } });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
};

// Resolver disputa
export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    const dispute = await prisma.dispute.update({ where: { id }, data: { status, resolution, resolvedAt: new Date() } });
    res.json(dispute);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao resolver disputa.' });
  }
};

// Listar todas as carteiras e saldos dos usuários
export const getWallets = async (req: Request, res: Response) => {
  try {
    const wallets = await prisma.wallet.findMany({
      include: { user: { select: { id: true, username: true, email: true } } }
    });
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar carteiras.' });
  }
};

// Listar todas as transações financeiras
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { wallet: { include: { user: { select: { id: true, username: true, email: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar transações.' });
  }
};

// Listar todos os saques pendentes
export const getWithdrawals = async (req: Request, res: Response) => {
  try {
    const withdrawals = await prisma.transaction.findMany({
      where: { type: 'withdraw', status: 'pending' },
      include: { wallet: { include: { user: { select: { id: true, username: true, email: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar saques.' });
  }
};

// Aprovar saque
export const approveWithdrawal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const withdrawal = await prisma.transaction.update({
      where: { id },
      data: { status: 'approved' }
    });
    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao aprovar saque.' });
  }
};

// CRUD Integrações
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    const integrations = await prisma.integration.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(integrations);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar integrações.' });
  }
};

export const createIntegration = async (req: Request, res: Response) => {
  try {
    const { name, type, status } = req.body;
    const integration = await prisma.integration.create({ data: { name, type, status } });
    res.json(integration);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar integração.' });
  }
};

export const updateIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, status } = req.body;
    const integration = await prisma.integration.update({ where: { id }, data: { name, type, status } });
    res.json(integration);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar integração.' });
  }
};

export const deleteIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.integration.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir integração.' });
  }
};

// CRUD Afiliados
export const getAffiliates = async (req: Request, res: Response) => {
  try {
    const affiliates = await prisma.affiliate.findMany({
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(affiliates);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar afiliados.' });
  }
};

export const createAffiliate = async (req: Request, res: Response) => {
  try {
    const { userId, link, rule } = req.body;
    const affiliate = await prisma.affiliate.create({ data: { userId, link, rule } });
    res.json(affiliate);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar afiliado.' });
  }
};

export const updateAffiliate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rule } = req.body;
    const affiliate = await prisma.affiliate.update({ where: { id }, data: { rule } });
    res.json(affiliate);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar afiliado.' });
  }
};

export const deleteAffiliate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.affiliate.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir afiliado.' });
  }
};

export const approveAffiliateWithdrawal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const affiliate = await prisma.affiliate.update({ where: { id }, data: { withdrawals: { decrement: 1 } } });
    res.json(affiliate);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao aprovar saque do afiliado.' });
  }
};

// CRUD Chat Admin
export const getAdminChats = async (req: Request, res: Response) => {
  try {
    const chats = await prisma.adminChat.findMany({ orderBy: { updatedAt: 'desc' } });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar chats.' });
  }
};

export const getAdminMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const messages = await prisma.adminMessage.findMany({ where: { chatId }, orderBy: { createdAt: 'asc' } });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
};

export const createAdminChat = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const chat = await prisma.adminChat.create({ data: { name } });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar chat.' });
  }
};

export const sendAdminMessage = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { from, text, date } = req.body;
    const message = await prisma.adminMessage.create({ data: { chatId, from, text, date } });
    // Atualiza o updatedAt do chat
    await prisma.adminChat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
}; 