# Dockerfile para backend Node/Express/Prisma (build dentro de /server)
FROM node:20-alpine

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Instala o OpenSSL
RUN apk add --no-cache openssl

# Copia apenas os arquivos de dependências para cache eficiente
COPY package*.json ./
COPY . .

# Instala dependências do backend
RUN npm install --production=false

# Gera o Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma

# Executa as migrations no banco (apenas em produção/Railway)
RUN if [ "$RAILWAY" = "true" ]; then npx prisma migrate deploy --schema=prisma/schema.prisma; fi

# Compila o TypeScript
RUN npm run build

# Copia a pasta do bot para o dist (necessário para require funcionar)
RUN cp -r src/bot dist/bot

# Exponha a porta da API
EXPOSE 4000

# Comando para rodar a aplicação
CMD ["npm", "start"] 
