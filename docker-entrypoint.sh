#!/bin/sh

# ========================================
# Script de entrada para Docker GGDF Backend - Railway
# ========================================

set -e

echo "🚀 Iniciando GGDF Backend no Railway..."

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não configurada!"
    exit 1
fi

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Sincronizar banco de dados (Railway usa db push)
echo "🗄️ Sincronizando banco de dados..."
npx prisma db push --accept-data-loss

# Executar seed se necessário
if [ "$RUN_SEED" = "true" ]; then
    echo "🌱 Executando seed do banco de dados..."
    npm run db:seed
fi

# Iniciar Steam Bot se necessário
if [ "$START_STEAM_BOT" = "true" ]; then
    echo "🤖 Iniciando Steam Bot em background..."
    npm run bot:start &
fi

echo "✅ Backend pronto! Iniciando aplicação..."

# Executar comando passado
exec "$@" 