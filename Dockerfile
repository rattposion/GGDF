# Dockerfile para backend Node/Express/Prisma
FROM node:18-alpine AS base

WORKDIR /app

# Instala o OpenSSL
RUN apk add --no-cache openssl

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install --production=false

# Copia o restante do código
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Compila o TypeScript
RUN npm run build

# Exponha a porta da API
EXPOSE 4000

# Comando para rodar a aplicação
CMD ["npm", "start"] 