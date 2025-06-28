FROM node:20

WORKDIR /app

# Copia apenas os arquivos necessários para instalar as dependências
COPY package*.json ./

# Instala dependências de produção e desenvolvimento
RUN npm ci

# Copia o restante do código da aplicação
COPY . .

# Define o comando padrão para iniciar o servidor
CMD ["npm", "start"]
