FROM node:20

WORKDIR /app

COPY package*.json ./

# Aqui vai funcionar porque o package-lock.json está limpo
RUN npm ci

COPY . .

CMD ["npm", "start"]
