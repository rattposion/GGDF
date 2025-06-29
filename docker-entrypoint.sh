#!/bin/sh

# ========================================
# Script de entrada para Docker GGDF Backend
# ========================================

set -e

echo "🚀 Iniciando GGDF Backend..."

# Aguardar banco de dados estar disponível
echo "⏳ Aguardando banco de dados..."
npx prisma db push --accept-data-loss

# Executar migrações se necessário
echo "🔄 Executando migrações..."
npx prisma migrate deploy

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

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