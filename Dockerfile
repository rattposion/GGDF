# Dockerfile para backend Node/Express/Prisma
FROM node:18-alpine AS base

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Instala o OpenSSL
RUN apk add --no-cache openssl

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install --production=false

# Copia o restante do código
COPY . .
# Copia explicitamente a pasta prisma (garantia)
COPY prisma ./prisma

# Gera o Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma

# Executa as migrations no banco (apenas em produção/Railway)
RUN if [ "$RAILWAY" = "true" ]; then npx prisma migrate deploy; fi

# Compila o TypeScript
RUN npm run build

# Exponha a porta da API
EXPOSE 4000

# Comando para rodar a aplicação
CMD ["npm", "start"] 