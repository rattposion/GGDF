import axios from 'axios'

// Configuração da Steam API
const STEAM_API_KEY = process.env.STEAM_API_KEY
const STEAM_API_BASE = 'https://api.steampowered.com'

// Interface para item Steam
interface SteamItem {
  assetid: string
  classid: string
  instanceid: string
  name: string
  market_name: string
  type: string
  rarity: string
  quality: string
  game: string
  icon_url: string
  icon_url_large: string
  float?: number
  wear?: string
  tradable: boolean
  marketable: boolean
}

// Interface para inventário Steam
interface SteamInventory {
  assets: SteamItem[]
  descriptions: any[]
  total_inventory_count: number
}

// Buscar inventário Steam
export async function getSteamInventory(steamId: string, appId: number = 730): Promise<SteamInventory> {
  try {
    const url = `${STEAM_API_BASE}/ISteamUserOAuth/GetInventory/v1/`
    const response = await axios.get(url, {
      params: {
        key: STEAM_API_KEY,
        steamid: steamId,
        appid: appId,
        contextid: 2, // Context ID padrão para CS2
        count: 5000,
      }
    })
    
    return response.data.response
  } catch (error) {
    console.error('Erro ao buscar inventário Steam:', error)
    throw new Error('Falha ao buscar inventário Steam')
  }
}

// Verificar se item pertence ao usuário
export async function verifyItemOwnership(steamId: string, assetId: string): Promise<boolean> {
  try {
    const inventory = await getSteamInventory(steamId)
    return inventory.assets.some(item => item.assetid === assetId)
  } catch (error) {
    console.error('Erro ao verificar propriedade do item:', error)
    return false
  }
}

// Buscar informações do usuário Steam
export async function getSteamUserInfo(steamId: string) {
  try {
    const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/`
    const response = await axios.get(url, {
      params: {
        key: STEAM_API_KEY,
        steamids: steamId,
      }
    })
    
    const players = response.data.response.players
    return players[0] || null
  } catch (error) {
    console.error('Erro ao buscar informações do usuário Steam:', error)
    throw new Error('Falha ao buscar informações do usuário Steam')
  }
}

// Converter Steam ID para Steam64 ID
export function convertToSteam64(steamId: string): string {
  if (steamId.startsWith('STEAM_')) {
    const parts = steamId.split(':')
    const accountId = parseInt(parts[2]) * 2 + parseInt(parts[1])
    return (BigInt(accountId) + BigInt('76561197960265728')).toString()
  }
  return steamId
}

// Converter Steam64 ID para Steam ID
export function convertToSteamId(steam64Id: string): string {
  const accountId = BigInt(steam64Id) - BigInt('76561197960265728')
  const accountIdInt = Number(accountId)
  const instance = accountIdInt % 2
  const accountIdHalf = Math.floor(accountIdInt / 2)
  return `STEAM_0:${instance}:${accountIdHalf}`
}

// Verificar se Steam ID é válido
export function isValidSteamId(steamId: string): boolean {
  if (steamId.startsWith('STEAM_')) {
    const steamIdRegex = /^STEAM_[0-9]:[0-9]:[0-9]+$/
    return steamIdRegex.test(steamId)
  }
  
  const steam64Regex = /^[0-9]{17}$/
  return steam64Regex.test(steamId)
}

// Buscar preço de item no mercado Steam
export async function getSteamMarketPrice(marketName: string, currency: number = 23): Promise<number> {
  try {
    const url = `${STEAM_API_BASE}/ISteamEconomy/GetMarketPriceOverview/v1/`
    const response = await axios.get(url, {
      params: {
        key: STEAM_API_KEY,
        market_hash_name: marketName,
        currency: currency, // 23 = BRL
      }
    })
    
    const data = response.data
    if (data.success && data.lowest_price) {
      // Converter string de preço para número
      const price = parseFloat(data.lowest_price.replace('R$ ', '').replace(',', '.'))
      return price
    }
    
    return 0
  } catch (error) {
    console.error('Erro ao buscar preço no mercado Steam:', error)
    return 0
  }
}

// TODO: Implementar integração com Steam Bot para trade offers
// Esta funcionalidade requer um bot Steam configurado com steam-user e steam-tradeoffer-manager

export {
  STEAM_API_KEY,
  STEAM_API_BASE,
} 