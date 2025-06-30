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

echo "✅ DATABASE_URL configurada: ${DATABASE_URL:0:50}..."

# Verificar se OpenSSL está instalado
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL não encontrado!"
    exit 1
fi

echo "✅ OpenSSL encontrado"

# Verificar se NEXTAUTH_SECRET está configurada
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET não configurada!"
    exit 1
fi

echo "✅ NEXTAUTH_SECRET configurada"

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Sincronizar banco de dados (Railway usa db push)
echo "🗄️ Sincronizando banco de dados..."
npx prisma db push --accept-data-loss

# Verificar se a sincronização foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Banco de dados sincronizado com sucesso"
else
    echo "❌ Erro ao sincronizar banco de dados"
    exit 1
fi

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