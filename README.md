# 🎮 GGDF Backend

Backend completo para marketplace de produtos digitais com foco em skins Steam, contas, keys e serviços.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router + API Routes)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Autenticação**: NextAuth.js + Steam OpenID
- **Upload**: Cloudinary
- **Pagamentos**: Gerencianet PIX
- **Realtime**: Socket.IO
- **Cache**: Redis
- **Filas**: BullMQ
- **Email**: Nodemailer
- **Monitoramento**: Sentry

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Conta Steam Developer (para Steam API)
- Conta Gerencianet (para PIX)
- Conta Cloudinary (para upload)

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ggdf_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Steam API
STEAM_API_KEY="your-steam-api-key"
STEAM_REALM="http://localhost:3000"
STEAM_RETURN_URL="http://localhost:3000/api/auth/steam/callback"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Gerencianet
GERENCIANET_CLIENT_ID="your-client-id"
GERENCIANET_CLIENT_SECRET="your-client-secret"
GERENCIANET_SANDBOX="true"

# Redis
REDIS_URL="redis://localhost:6379"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@ggdf.com"
```

4. **Configure o banco de dados**
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular com dados iniciais
npm run db:seed
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

O backend estará disponível em `http://localhost:3000`

## 📊 Estrutura do Banco

### Principais Entidades

- **User**: Usuários (compradores, vendedores, admins)
- **Product**: Produtos com variações e planos
- **Category/Subcategory**: Categorização hierárquica
- **Order**: Pedidos com status e pagamentos
- **Delivery**: Entregas automáticas
- **Review**: Avaliações de produtos
- **Question**: Perguntas e respostas
- **Chat**: Chat pós-compra
- **Wallet**: Carteira e transações
- **Notification**: Notificações em tempo real
- **SteamItem**: Itens do inventário Steam

## 🔐 Autenticação

### Métodos Suportados

1. **Email/Senha**
   - Registro com verificação de email
   - Login com JWT
   - Recuperação de senha

2. **Steam OpenID**
   - Login direto via Steam
   - Sincronização de inventário
   - Custódia de skins

3. **2FA (Opcional)**
   - Código via app (TOTP)
   - Código via email

### Rotas de Autenticação

```
POST /api/auth/register     # Registro
POST /api/auth/login        # Login
GET  /api/auth/steam        # Login Steam
POST /api/auth/2fa/enable   # Ativar 2FA
POST /api/auth/logout       # Logout
```

## 🛍️ Produtos

### Tipos de Produto

- **SKIN**: Skins de jogos (CS2, Dota 2, etc.)
- **CONTA**: Contas de serviços (Netflix, Steam, etc.)
- **KEY**: Chaves de ativação
- **JOGO**: Jogos completos
- **SERVICO**: Serviços (boost, coaching, etc.)
- **ASSINATURA**: Planos recorrentes

### Rotas de Produtos

```
GET    /api/products              # Listar produtos
GET    /api/products/:id          # Produto específico
POST   /api/products              # Criar produto (vendedor)
PUT    /api/products/:id          # Atualizar produto
DELETE /api/products/:id          # Excluir produto
GET    /api/products/me           # Meus produtos
```

## 💳 Pagamentos

### Integração PIX (Gerencianet)

- Criação automática de cobranças
- Webhook para confirmação
- Entrega automática após pagamento
- Suporte a múltiplos métodos

### Rotas de Checkout

```
POST /api/checkout               # Criar pedido
POST /api/checkout/webhook       # Webhook PIX
GET  /api/orders/me              # Meus pedidos
POST /api/orders/:id/dispute     # Abrir disputa
```

## 🚚 Entrega Automática

### Tipos de Entrega

- **TEXT**: Texto simples
- **LINK**: URL de download
- **FILE**: Arquivo anexado
- **STEAM_TRADE**: Trade automático via bot

### Processo

1. Pagamento confirmado
2. Entrega processada automaticamente
3. Notificação enviada ao comprador
4. Chat liberado por 3 dias

## 💬 Chat Pós-Compra

### Funcionalidades

- Chat privado entre comprador e vendedor
- Suporte a arquivos e links
- Tempo limitado (3 dias)
- Notificações em tempo real

### Rotas de Chat

```
POST /api/chat/:orderId/start    # Iniciar chat
POST /api/chat/:roomId/send      # Enviar mensagem
GET  /api/chat/:roomId           # Histórico
```

## 🎒 Steam Integration

### Funcionalidades

- Sincronização de inventário
- Custódia obrigatória para skins
- Trade automático via bot
- Verificação de float/wear

### Rotas Steam

```
POST /api/steam/deposit          # Depositar item
POST /api/steam/check            # Verificar item
POST /api/steam/send             # Enviar item
GET  /api/steam/inventory        # Inventário
```

## 📊 Admin Panel

### Funcionalidades

- Gerenciamento de usuários
- Aprovação de produtos
- Resolução de disputas
- Relatórios e estatísticas
- Configurações do sistema

### Rotas Admin

```
GET  /api/admin/users            # Listar usuários
POST /api/admin/users/:id/ban    # Banir usuário
GET  /api/admin/products         # Produtos pendentes
POST /api/admin/products/:id/approve  # Aprovar produto
GET  /api/admin/disputes         # Disputas
POST /api/admin/disputes/:id/resolve  # Resolver disputa
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Servidor de produção
npm run lint             # Linting
npm run db:generate      # Gerar cliente Prisma
npm run db:migrate       # Executar migrações
npm run db:seed          # Popular banco
npm run db:studio        # Abrir Prisma Studio
```

### Estrutura de Pastas

```
backend/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticação
│   │   ├── products/      # Produtos
│   │   ├── orders/        # Pedidos
│   │   ├── chat/          # Chat
│   │   ├── admin/         # Admin
│   │   └── ...
│   └── ...
├── lib/                   # Utilitários
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth.ts           # Config NextAuth
│   └── utils.ts          # Funções auxiliares
├── prisma/               # Schema e migrações
│   ├── schema.prisma     # Schema do banco
│   └── seed.ts           # Dados iniciais
├── middleware.ts         # Middleware Next.js
└── package.json
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Outras Plataformas

- **Railway**: Deploy automático com PostgreSQL
- **Render**: Suporte nativo a Node.js
- **Heroku**: Configuração manual necessária

## 🔒 Segurança

### Implementado

- Rate limiting por IP
- Validação de entrada com Zod
- Sanitização de HTML
- CORS configurado
- Headers de segurança
- JWT com expiração
- Hash de senhas (bcrypt)

### Recomendações

- Use HTTPS em produção
- Configure firewall adequado
- Monitore logs de acesso
- Implemente backup automático
- Use variáveis de ambiente seguras

## 📈 Monitoramento

### Sentry

```javascript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Logs

- Logs estruturados com Winston
- Activity logs para auditoria
- Error tracking automático
- Performance monitoring

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Email**: suporte@ggdf.com
- **Discord**: [Link do servidor]
- **Documentação**: [Link da docs]

---

Desenvolvido com ❤️ pela equipe GGDF 