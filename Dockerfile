# Imagem base oficial do Node.js
FROM node:20-alpine AS base

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala dependências de produção
RUN npm ci --omit=dev

# Copia o restante do código
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Build do Next.js
RUN npm run build

# Expor a porta padrão do Next.js
EXPOSE 3000

# Variáveis de ambiente padrão (pode ser sobrescrita no Railway)
ENV NODE_ENV=production

# Comando de inicialização
CMD ["npm", "start"] 