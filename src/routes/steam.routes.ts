import { Router } from 'express';
import axios from 'axios';
import { authenticate } from '../middlewares/auth.middleware';
import prisma from '../prisma';
const steamBot = require('../bot/steamBot');

const router = Router();

router.get('/inventory', authenticate, async (req, res) => {
  const user = (req as any).user;
  if (!user || !user.steamId) {
    return res.status(400).json({ error: 'Usuário não vinculado ao Steam.' });
  }
  const steamId = user.steamId;
  try {
    // Busca via bot logado
    const { inventory, currencies } = await steamBot.getUserInventory(steamId, 730, 2);
    res.json({ inventory, currencies });
  } catch (err: any) {
    console.error('Erro ao buscar inventário via bot:', err && err.message, err && err.stack);
    if (err.message && (err.message.includes('This profile is private') || err.message.includes('not found'))) {
      return res.status(403).json({ error: 'Inventário privado ou não encontrado. Torne seu inventário público nas configurações da Steam.' });
    }
    res.status(502).json({ error: 'Erro ao acessar a Steam via bot. Tente novamente mais tarde.' });
  }
});

// Criar trade offer REAL
router.post('/trade-offer', authenticate, async (req, res) => {
  const user = (req as any).user;
  const { steam_item_id, appid, item_name, subcategory_id, product_id } = req.body;
  try {
    // Chama o bot real
    const { tradeId, status } = await steamBot.sendTradeOffer({
      userSteamId: user.steamId,
      assetId: steam_item_id,
      appid,
    });
    // Cria trade no banco
    const trade = await prisma.steamTrade.create({
      data: {
        steamItemId: steam_item_id,
        itemName: item_name,
        gameId: appid,
        subcategoryId: subcategory_id,
        tradeId,
        status: status || 'aguardando_entrega',
        productId: product_id || null,
      }
    });
    res.json({ trade_id: tradeId });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar trade offer.' });
  }
});

// Checar status da trade
router.get('/trade-status/:tradeId', authenticate, async (req, res) => {
  const { tradeId } = req.params;
  const trade = await prisma.steamTrade.findUnique({ where: { tradeId } });
  if (!trade) return res.status(404).json({ error: 'Trade não encontrada.' });
  // Mapear status numérico para string amigável
  let status = trade.status;
  if (!isNaN(Number(status))) {
    // Steam states: 2=Active, 3=Accepted, 6=Declined, 5=Expired, 7=Canceled
    if (status === '3') status = 'recebido';
    else if (status === '2') status = 'aguardando_entrega';
    else if (['6','5','7'].includes(status)) status = 'cancelado';
    else status = 'aguardando_entrega';
  }
  res.json({ status });
});

export default router; 
