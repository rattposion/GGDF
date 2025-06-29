# ========================================
# Dockerfile para GGDF Backend
# Marketplace de Produtos Digitais
# ========================================

# Estágio 1: Dependências de desenvolvimento
FROM node:18-alpine AS deps

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./
COPY prisma ./prisma/

# Instalar dependências (usando npm install em vez de npm ci)
RUN npm install --only=production && npm cache clean --force

# ========================================
# Estágio 2: Build da aplicação
FROM node:18-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação Next.js
RUN npm run build

# ========================================
# Estágio 3: Imagem de produção
FROM node:18-alpine AS runner

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

# Definir diretório de trabalho
WORKDIR /app

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar arquivos necessários
COPY --from=builder /app/public ./public

# Copiar arquivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar cliente Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar scripts e configurações
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/middleware.ts ./

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Variável de ambiente para o host
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Script de inicialização
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"] 