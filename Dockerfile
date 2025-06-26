# Dockerfile para backend Node/Express/Prisma (build a partir da raiz)
FROM node:20-alpine

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Instala o OpenSSL
RUN apk add --no-cache openssl

# Copia apenas os arquivos de dependências para cache eficiente
COPY server/package*.json ./server/
COPY package*.json ./

# Instala dependências do backend
WORKDIR /app/server
RUN npm install --production=false

# Copia o restante do código do backend e o schema do Prisma
WORKDIR /app
COPY server ./server

# Gera o Prisma Client
WORKDIR /app/server
RUN npx prisma generate --schema=prisma/schema.prisma

# Executa as migrations no banco (apenas em produção/Railway)
RUN if [ "$RAILWAY" = "true" ]; then npx prisma migrate deploy --schema=prisma/schema.prisma; fi

# Compila o TypeScript
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
