#!/usr/bin/env tsx

import { initializeSteamBot, isBotReady, getBotInfo } from '../lib/steam-bot'
import { prisma } from '../lib/prisma'

async function startBot() {
  try {
    console.log('🚀 Iniciando Steam Bot...')
    
    // Conectar ao banco de dados
    await prisma.$connect()
    console.log('✅ Conectado ao banco de dados')
    
    // Inicializar Steam Bot
    await initializeSteamBot()
    
    // Verificar status
    const botInfo = getBotInfo()
    console.log('📊 Status do Bot:', botInfo)
    
    // Manter o processo rodando
    setInterval(() => {
      const status = isBotReady()
      if (!status) {
        console.log('⚠️ Bot não está pronto, tentando reconectar...')
        initializeSteamBot().catch(console.error)
      }
    }, 60000) // Verificar a cada minuto
    
    console.log('✅ Steam Bot iniciado com sucesso!')
    console.log('📝 Logs serão exibidos aqui...')
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Desligando Steam Bot...')
      await prisma.$disconnect()
      process.exit(0)
    })
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Desligando Steam Bot...')
      await prisma.$disconnect()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('❌ Erro ao iniciar Steam Bot:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  startBot()
}

export { startBot } 