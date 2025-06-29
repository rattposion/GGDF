# 🚀 Deploy no Railway - GGDF Backend

## ✅ **Configuração Completa para Railway**

### **📋 Pré-requisitos:**
- Conta no Railway (railway.app)
- Projeto no GitHub
- PostgreSQL configurado no Railway

---

## **🔧 Configuração no Railway**

### **1. Conectar Repositório**
1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório `GGDF`
5. Selecione a pasta `backend`

### **2. Configurar Banco de Dados**
1. No projeto Railway, clique em "New"
2. Selecione "Database" → "PostgreSQL"
3. Aguarde a criação do banco
4. Copie a `DATABASE_URL` fornecida

### **3. Configurar Variáveis de Ambiente**

No seu projeto Railway, vá em "Variables" e configure:

#### **🔑 Variáveis Essenciais:**
```env
# Banco de Dados (Railway fornece automaticamente)
DATABASE_URL="postgresql://postgres:IpNWWDeNbbTJPBgpEBXNopvjiEjqXLIa@metro.proxy.rlwy.net:31671/railway"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-muito-segura-aqui"
NEXTAUTH_URL="https://seu-app.railway.app"

# JWT
JWT_SECRET="sua-chave-jwt-muito-segura-aqui"

# Ambiente
NODE_ENV="production"
PORT="3000"
```

#### **🔑 Variáveis Opcionais:**
```env
# Steam (se quiser login Steam)
STEAM_API_KEY="sua-steam-api-key"
STEAM_CLIENT_ID="seu-steam-client-id"
STEAM_CLIENT_SECRET="seu-steam-client-secret"

# Stripe (se quiser pagamentos)
STRIPE_SECRET_KEY="sk_live_sua-chave-stripe"
STRIPE_PUBLISHABLE_KEY="pk_live_sua-chave-stripe"

# Redis (se quiser cache)
REDIS_URL="redis://seu-redis-url"

# Email (se quiser notificações)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-app-password"

# Cloudinary (se quiser upload)
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

---

## **🐳 Configuração Docker**

### **Arquivos Configurados:**
- ✅ `Dockerfile` - Otimizado para Railway
- ✅ `docker-entrypoint.sh` - Script de inicialização
- ✅ `railway.json` - Configuração Railway
- ✅ `next.config.js` - Output standalone

### **Processo de Build:**
1. **Dependências** - Instalação otimizada
2. **Prisma** - Geração do cliente
3. **Build** - Next.js standalone
4. **Runtime** - Imagem otimizada

---

## **🚀 Deploy Automático**

### **1. Push para GitHub**
```bash
git add .
git commit -m "Configuração Railway completa"
git push origin main
```

### **2. Railway Deploy**
- Railway detecta automaticamente o Dockerfile
- Executa o build multi-stage
- Configura o banco de dados
- Inicia a aplicação

### **3. Verificar Deploy**
- Acesse o domínio fornecido pelo Railway
- Teste a rota `/api/health`
- Verifique os logs no Railway

---

## **🔍 Monitoramento**

### **Health Check:**
- **Rota:** `/api/health`
- **Timeout:** 300s
- **Intervalo:** Automático

### **Logs:**
- Acesse "Deployments" no Railway
- Clique no deployment mais recente
- Veja logs em tempo real

### **Métricas:**
- CPU e RAM
- Requests/minuto
- Tempo de resposta

---

## **🛠️ Comandos Úteis**

### **Local Development:**
```bash
# Desenvolvimento
npm run dev

# Build local
npm run build

# Teste local
npm start
```

### **Railway CLI:**
```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Deploy manual
railway up

# Ver logs
railway logs

# Abrir projeto
railway open
```

---

## **🔧 Troubleshooting**

### **Erro de Build:**
```bash
# Verificar logs
railway logs

# Rebuild
railway up --force
```

### **Erro de Banco:**
```bash
# Verificar DATABASE_URL
railway variables

# Resetar banco
railway run npx prisma db push --force-reset
```

### **Erro de Porta:**
- Verificar se `PORT=3000` está configurado
- Railway usa a porta automaticamente

---

## **📊 Status da Aplicação**

### **✅ Funcionalidades Prontas:**
- ✅ API REST completa
- ✅ Autenticação NextAuth
- ✅ Chat em tempo real (Socket.IO)
- ✅ Sistema de disputas
- ✅ CRUD de produtos
- ✅ Banco PostgreSQL
- ✅ Health check
- ✅ Logs estruturados

### **🚧 Funcionalidades Pendentes:**
- 🔄 Provider Steam (comentado)
- 🔄 Funções JWT (comentadas)
- 🔄 Upload de arquivos
- 🔄 Pagamentos Stripe
- 🔄 Notificações push

---

## **🎯 Próximos Passos**

### **1. Testar API:**
```bash
# Health check
curl https://seu-app.railway.app/api/health

# Listar produtos
curl https://seu-app.railway.app/api/products

# Registrar usuário
curl -X POST https://seu-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'
```

### **2. Configurar Domínio:**
- No Railway, vá em "Settings"
- Configure domínio personalizado
- Configure SSL automático

### **3. Monitoramento:**
- Configure alertas
- Monitore performance
- Configure backups

---

## **🎉 Sucesso!**

**Seu backend está rodando no Railway com:**
- ✅ Docker otimizado
- ✅ PostgreSQL configurado
- ✅ Deploy automático
- ✅ Health checks
- ✅ Logs estruturados
- ✅ Escalabilidade automática

**URL da API:** `https://seu-app.railway.app`
**Health Check:** `https://seu-app.railway.app/api/health` 