import SteamUser from 'steam-user'
import TradeOfferManager from 'steam-tradeoffer-manager'
import SteamTotp from 'steam-totp'
import { prisma } from './prisma'

// Interfaces para tipos
interface TradeOffer {
  id: string
  state: number
  message: string
  itemsToReceive: Array<{
    assetid: string
    appid: number
    contextid: number
  }>
  accept(): Promise<any>
}

interface TradeOfferResult {
  id: string
  state: number
}

// Configuração do Steam Bot
const bot = new SteamUser({
  username: process.env.STEAM_BOT_USERNAME!,
  password: process.env.STEAM_BOT_PASSWORD!,
  sharedSecret: process.env.STEAM_BOT_SHARED_SECRET!,
  identitySecret: process.env.STEAM_BOT_IDENTITY_SECRET!,
})

// Configuração do Trade Offer Manager
const manager = new TradeOfferManager({
  steam: bot,
  domain: process.env.APP_URL,
  language: 'pt-BR',
})

// Estados do bot
let botReady = false
let botLoggedIn = false

// Inicializar bot
export async function initializeSteamBot() {
  try {
    console.log('🔄 Iniciando Steam Bot...')

    // Configurar eventos do bot
    bot.on('loggedOn', () => {
      console.log('✅ Steam Bot logado com sucesso')
      botLoggedIn = true
      bot.setPersona(SteamUser.EPersonaState.Online)
    })

    bot.on('error', (error: Error) => {
      console.error('❌ Erro no Steam Bot:', error)
      botLoggedIn = false
    })

    bot.on('disconnected', () => {
      console.log('🔌 Steam Bot desconectado')
      botLoggedIn = false
      // Tentar reconectar após 30 segundos
      setTimeout(() => {
        if (!botLoggedIn) {
          console.log('🔄 Tentando reconectar Steam Bot...')
          bot.logOn()
        }
      }, 30000)
    })

    // Configurar eventos do Trade Manager
    manager.on('sentOfferChanged', (offer: TradeOffer, oldState: number) => {
      console.log(`📤 Trade offer ${offer.id} mudou de ${oldState} para ${offer.state}`)
      handleTradeOfferChange(offer)
    })

    manager.on('receivedOfferChanged', (offer: TradeOffer, oldState: number) => {
      console.log(`📥 Trade offer recebida ${offer.id} mudou de ${oldState} para ${offer.state}`)
      handleReceivedTradeOffer(offer)
    })

    // Fazer login
    await bot.logOn()
    botReady = true

  } catch (error) {
    console.error('❌ Erro ao inicializar Steam Bot:', error)
    throw error
  }
}

// Criar trade offer para depositar item
export async function createDepositTradeOffer(userSteamId: string, assetId: string, orderId: string): Promise<TradeOfferResult> {
  try {
    if (!botReady || !botLoggedIn) {
      throw new Error('Steam Bot não está pronto')
    }

    const offer = manager.createOffer(userSteamId)

    // Adicionar item do usuário (que será enviado para o bot)
    offer.addTheirItem({
      assetid: assetId,
      appid: 730, // CS2
      contextid: 2,
    })

    // Definir mensagem
    offer.setMessage(`Depósito para pedido ${orderId}`)

    // Enviar trade offer
    const result = await offer.send()
    console.log(`📤 Trade offer de depósito enviada: ${result.id}`)

    // Salvar ID da trade offer no banco
    await prisma.steamItem.updateMany({
      where: { assetId },
      data: { botOfferId: result.id.toString() }
    })

    return result

  } catch (error) {
    console.error('❌ Erro ao criar trade offer de depósito:', error)
    throw error
  }
}

// Criar trade offer para entregar item
export async function createDeliveryTradeOffer(userSteamId: string, assetId: string, orderId: string): Promise<TradeOfferResult> {
  try {
    if (!botReady || !botLoggedIn) {
      throw new Error('Steam Bot não está pronto')
    }

    const offer = manager.createOffer(userSteamId)

    // Adicionar item do bot (que será enviado para o usuário)
    offer.addMyItem({
      assetid: assetId,
      appid: 730, // CS2
      contextid: 2,
    })

    // Definir mensagem
    offer.setMessage(`Entrega do pedido ${orderId}`)

    // Enviar trade offer
    const result = await offer.send()
    console.log(`📤 Trade offer de entrega enviada: ${result.id}`)

    return result

  } catch (error) {
    console.error('❌ Erro ao criar trade offer de entrega:', error)
    throw error
  }
}

// Aceitar trade offer recebida (depósito)
export async function acceptDepositTradeOffer(offerId: string): Promise<boolean> {
  try {
    const offer = await manager.getOffer(offerId) as TradeOffer
    
    if (!offer) {
      throw new Error('Trade offer não encontrada')
    }

    // Verificar se é um depósito válido
    const assetId = offer.itemsToReceive[0]?.assetid
    if (!assetId) {
      throw new Error('Nenhum item encontrado na trade offer')
    }

    // Aceitar trade offer
    await offer.accept()
    console.log(`✅ Trade offer de depósito aceita: ${offerId}`)

    // Atualizar status do item no banco
    await prisma.steamItem.updateMany({
      where: { assetId: assetId.toString() },
      data: { 
        inCustody: true,
        listedForSale: true
      }
    })

    return true

  } catch (error) {
    console.error('❌ Erro ao aceitar trade offer de depósito:', error)
    throw error
  }
}

// Processar mudança de estado de trade offer enviada
async function handleTradeOfferChange(offer: TradeOffer): Promise<void> {
  try {
    const orderId = extractOrderIdFromMessage(offer.message)
    
    if (!orderId) return

    switch (offer.state) {
      case TradeOfferManager.ETradeOfferState.Accepted:
        console.log(`✅ Trade offer aceita pelo usuário: ${offer.id}`)
        await handleTradeAccepted(orderId, offer)
        break
        
      case TradeOfferManager.ETradeOfferState.Declined:
        console.log(`❌ Trade offer recusada pelo usuário: ${offer.id}`)
        await handleTradeDeclined(orderId, offer)
        break
        
      case TradeOfferManager.ETradeOfferState.Expired:
        console.log(`⏰ Trade offer expirada: ${offer.id}`)
        await handleTradeExpired(orderId, offer)
        break
    }

  } catch (error) {
    console.error('❌ Erro ao processar mudança de trade offer:', error)
  }
}

// Processar trade offer recebida
async function handleReceivedTradeOffer(offer: TradeOffer): Promise<void> {
  try {
    // Verificar se é um depósito
    if (offer.message.includes('Depósito para pedido')) {
      await acceptDepositTradeOffer(offer.id)
    }

  } catch (error) {
    console.error('❌ Erro ao processar trade offer recebida:', error)
  }
}

// Extrair ID do pedido da mensagem
function extractOrderIdFromMessage(message: string): string | null {
  const match = message.match(/pedido (\w+)/)
  return match ? match[1] : null
}

// Processar trade aceita
async function handleTradeAccepted(orderId: string, offer: TradeOffer): Promise<void> {
  try {
    // Atualizar status do pedido
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'DELIVERED',
        deliveredAt: new Date()
      }
    })

    // Criar entrega
    await prisma.delivery.create({
      data: {
        orderId,
        type: 'STEAM_TRADE',
        content: `Trade offer ${offer.id} aceita`,
        status: 'DELIVERED',
        deliveredAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      }
    })

    console.log(`✅ Entrega processada para pedido ${orderId}`)

  } catch (error) {
    console.error('❌ Erro ao processar trade aceita:', error)
  }
}

// Processar trade recusada
async function handleTradeDeclined(orderId: string, offer: TradeOffer): Promise<void> {
  try {
    // Atualizar status do pedido
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'DISPUTED',
      }
    })

    console.log(`❌ Trade recusada para pedido ${orderId}`)

  } catch (error) {
    console.error('❌ Erro ao processar trade recusada:', error)
  }
}

// Processar trade expirada
async function handleTradeExpired(orderId: string, offer: TradeOffer): Promise<void> {
  try {
    // Atualizar status do pedido
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'CANCELLED',
      }
    })

    console.log(`⏰ Trade expirada para pedido ${orderId}`)

  } catch (error) {
    console.error('❌ Erro ao processar trade expirada:', error)
  }
}

// Verificar se bot está pronto
export function isBotReady(): boolean {
  return botReady && botLoggedIn
}

// Obter informações do bot
export function getBotInfo() {
  return {
    ready: botReady,
    loggedIn: botLoggedIn,
    username: process.env.STEAM_BOT_USERNAME,
  }
}

export default {
  initializeSteamBot,
  createDepositTradeOffer,
  createDeliveryTradeOffer,
  acceptDepositTradeOffer,
  isBotReady,
  getBotInfo,
} 