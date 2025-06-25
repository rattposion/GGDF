# Dockerfile para backend Node/Express/Prisma
FROM node:20-alpine AS base

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Instala o OpenSSL
RUN apk add --no-cache openssl

# Copia apenas os arquivos de dependências para cache eficiente
COPY ../package*.json ./
COPY package*.json ./

# Instala dependências do backend
RUN npm install --production=false

# Copia o restante do código do backend e o schema do Prisma
COPY . .

# Gera o Prisma Client a partir da raiz (usando o script já ajustado)
RUN npx prisma generate --schema=server/prisma/schema.prisma

# Executa as migrations no banco (apenas em produção/Railway)
RUN if [ "$RAILWAY" = "true" ]; then npx prisma migrate deploy --schema=server/prisma/schema.prisma; fi

# Compila o TypeScript
RUN npm run build

# Exponha a porta da API
EXPOSE 4000

# Comando para rodar a aplicação
CMD ["npm", "start"] 
