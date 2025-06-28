# Imagem base oficial do Node.js
FROM node:18-alpine AS builder

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala dependências de produção e desenvolvimento
RUN npm install --production=false

# Copia o restante do código
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Build do TypeScript
RUN npm run build

# Remove dependências de desenvolvimento
RUN npm prune --production

# Imagem final para produção
FROM node:18-alpine
WORKDIR /app

# Copia apenas arquivos necessários da build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./
COPY --from=builder /app/generated ./generated

# Porta padrão
EXPOSE 3333

# Comando de inicialização
CMD ["node", "dist/server.js"] 