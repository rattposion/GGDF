// Esqueleto do módulo de integração com o bot Steam
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const prisma = require('../prisma');
const SteamTotp = require('steam-totp');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
  steam: client,
  community,
  language: 'en',
});

// Configurações do bot (preencher com dados reais via env)
const BOT_USERNAME = process.env.STEAM_BOT_USERNAME;
const BOT_PASSWORD = process.env.STEAM_BOT_PASSWORD;
const BOT_SHARED_SECRET = process.env.STEAM_BOT_SHARED_SECRET;
const BOT_IDENTITY_SECRET = process.env.STEAM_BOT_IDENTITY_SECRET;

// Login do bot
function login() {
  client.logOn({
    accountName: BOT_USERNAME,
    password: BOT_PASSWORD,
    twoFactorCode: SteamTotp.generateAuthCode(BOT_SHARED_SECRET),
  });
}

client.on('loggedOn', () => {
  console.log('Bot Steam logado!');
  client.setPersona(SteamUser.EPersonaState.Online);
});

client.on('webSession', (sessionID, cookies) => {
  manager.setCookies(cookies, (err) => {
    if (err) {
      console.error('Erro ao setar cookies no manager:', err);
      return;
    }
    console.log('TradeOfferManager pronto!');
  });
  community.setCookies(cookies);
});

// Enviar trade offer para o bot
async function sendTradeOffer({ userSteamId, assetId, appid }) {
  return new Promise((resolve, reject) => {
    const offer = manager.createOffer(userSteamId);
    offer.addTheirItem({
      appid: parseInt(appid),
      contextid: '2',
      assetid: assetId,
    });
    offer.setMessage('Envie este item para o bot da plataforma.');
    offer.send((err, status) => {
      if (err) return reject(err);
      resolve({ tradeId: offer.id, status });
    });
  });
}

// Consultar status da trade
async function getTradeStatus(tradeId) {
  return new Promise((resolve, reject) => {
    manager.getOffer(tradeId, (err, offer) => {
      if (err) return reject(err);
      resolve(offer.state); // Ex: 2 = Active, 3 = Accepted, 6 = Declined, etc
    });
  });
}

// Eventos de trade
manager.on('sentOfferChanged', async (offer, oldState) => {
  console.log(`Trade ${offer.id} mudou de estado: ${oldState} -> ${offer.state}`);
  // Atualizar status da trade no banco
  try {
    await prisma.steamTrade.update({
      where: { tradeId: offer.id },
      data: { status: offer.state.toString() },
    });
  } catch (e) {
    console.error('Erro ao atualizar status da trade no banco:', e);
  }
  // Aqui pode notificar o backend via API/webhook se desejar
});

module.exports = {
  login,
  sendTradeOffer,
  getTradeStatus,
};

// Auto login ao importar
login(); 