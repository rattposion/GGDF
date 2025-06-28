import { Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '../generated/prisma';
import { getCache, setCache } from '../utils/cache';

const prisma = new PrismaClient();
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const APP_ID = 730; // CS:GO

export const getInventory = async (req: Request, res: Response): Promise<void> => {
  const { steamId } = req.params;
  try {
    const url = `https://steamcommunity.com/inventory/${steamId}/${APP_ID}/2?l=english&count=5000`;
    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar inventário Steam.' });
  }
};

export const importItems = async (req: Request, res: Response): Promise<void> => {
  const { steamId, items } = req.body; // items: array de assetids
  const userId = req.user?.userId || null;
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado.' });
    return;
  }
  try {
    // Verifica se o steamId pertence ao usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.steamId !== steamId) {
      res.status(403).json({ error: 'SteamID não pertence ao usuário.' });
      return;
    }
    // Buscar inventário do usuário
    const url = `https://steamcommunity.com/inventory/${steamId}/${APP_ID}/2?l=english&count=5000`;
    const { data } = await axios.get(url);
    const assets = data.assets || [];
    const descriptions = data.descriptions || [];
    // Filtrar os itens selecionados
    const selected = assets.filter((a: any) => items.includes(a.assetid));
    // Mapear para estrutura de produto
    const products = selected.map((a: any) => {
      const desc = descriptions.find((d: any) => d.classid === a.classid && d.instanceid === a.instanceid);
      return {
        name: desc?.market_hash_name || 'Item Steam',
        description: desc?.descriptions?.map((d: any) => d.value).join('\n') || '',
        price: 0, // O preço pode ser atualizado depois via endpoint de preço
        ownerId: userId,
      };
    });
    // Salvar produtos no banco
    await prisma.product.createMany({ data: products });
    res.json({ message: 'Itens importados com sucesso.', count: products.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao importar itens.' });
  }
};

export const getPrice = async (req: Request, res: Response): Promise<void> => {
  const { market_hash_name } = req.params;
  const cacheKey = `price_${market_hash_name}`;
  const cached = getCache(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }
  try {
    const url = `https://steamcommunity.com/market/priceoverview/?appid=${APP_ID}&currency=7&market_hash_name=${encodeURIComponent(market_hash_name)}`;
    const { data } = await axios.get(url);
    setCache(cacheKey, data, 300); // cache por 5 minutos
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar preço do item.' });
  }
}; 