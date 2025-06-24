Crie um projeto web full-stack para um **marketplace de produtos digitais**, estilo DFG ou GGMAX, onde usuários possam comprar e vender:

- Skins de jogos (Steam, CS:GO, Dota 2, etc.)
- Contas de jogos (Steam, Epic Games, Riot, etc.)
- Serviços digitais (boost, configs, design, scripts)
- Keys de jogos (Steam, Uplay, Battle.net, etc.)
- Assinaturas (Game Pass, PS Plus, Spotify, etc.)

## 🎯 Funcionalidades por tipo de produto:
🔔 Notificações Inteligentes
- Notificações em tempo real (via WebSocket) e histórico no painel
- Eventos: nova venda, nova compra, pagamento confirmado, disputa, mensagem no chat da compra, pergunta/resposta em anúncio, saque aprovado, avaliação recebida
- Cada notificação tem título, mensagem, tipo, status (lido/não lido), e redireciona para a ação (chat, disputa, pedido, etc.)
- Componente visual com ícone 🔔 no header
- Sistema de leitura, agrupamento por tipo/data
- Notificações críticas também por e-mail

Sistema de Assinaturas
- Produtos podem ser vendidos como planos de acesso por tempo: diário, semanal, mensal ou lifetime
- Campos no anúncio: tipo do plano, auto-renovação, descrição da entrega
- Após a compra, o usuário ganha acesso ao produto (arquivo, conta, painel)
- Verificação de validade do plano com rotina automática
- Painel do usuário com todas as suas assinaturas, cancelamento e renovação
- Notificações automáticas sobre status e expiração


### 🎮 Skins:
- Integração Steam (inventário)
- Login Steam
- Colocar skin à venda com print/link
- Checkout com saldo ou Pix

### 👤 Contas:
- Upload de dados (user/pass, e-mail, prints)
- Campo de garantias e informações adicionais
- Exibir status: **Pronta entrega**, **Sob encomenda**

📦 Sistema de Assinaturas com Planos Múltiplos

- Vendedor pode ativar múltiplos planos para o mesmo produto: diário, semanal, mensal, vitalício
- Cada plano tem um preço independente configurado no cadastro
- Comprador seleciona qual deseja no momento da compra
- Após o pagamento, o sistema ativa a assinatura pelo tempo correto
- Interface mostra claramente cada plano com preço e duração

🧩 Variações de Produto (Opções Personalizadas)
- Vendedor pode criar múltiplas versões de um mesmo produto (ex: Básica, Pro, Elite)
- Cada opção tem:
  - Nome
  - Preço individual
  - Descrição
  - Estoque opcional
  - Assinatura opcional (plano associado)
- Usuário escolhe a versão desejada antes do pagamento
- Interface mostra de forma clara todas as opções disponíveis

### 🛠️ Serviços:
- Anúncios com título, descrição, prazo e preço
- Sistema de pedido e entrega via painel
- Avaliação pós-serviço

Entrega Automática de Produto
- Vendedor pode configurar entrega automática por:
  - Texto (ex: login/senha, chave)
  - Link (URL privada ou painel)
  - Arquivo (entrega via download protegido)
- Sistema envia a entrega automaticamente após pagamento aprovado
- Entrega visível no painel do comprador em “Meus pedidos”
- Suporte a múltiplas entregas por variação de produto
- URLs protegidas com expiração ou controle de acesso
- Admin pode rever entregas em caso de disputa


Custódia Automática de Skins Steam
- Se o produto for uma skin Steam (CS:GO, Dota 2, etc.), ele só é publicado após a entrega da skin ao inventário do bot da plataforma
- Sistema fornece link de troca para o vendedor
- Backend valida o recebimento da skin via Steam API
- Produto só é ativado após depósito confirmado
- Após a compra, a plataforma envia automaticamente a skin ao comprador via trade offer do bot
- Todos os processos são auditáveis para segurança contra fraudes

### 🔑 Keys:
- Inserir key manual ou gerar estoque automático
- Sistema anti-revenda duplicada
- Entrega automática após pagamento


🗂️ Sistema de Categorias e Subcategorias

- Produtos são organizados por categoria e subcategoria (ex: Contas > Netflix)
- Sistema de criação, edição e exclusão de categorias no painel admin
- Página pública por categoria com URL amigável e filtros (ex: /categoria/serviços/boost)
- Filtros dinâmicos: tipo de produto, preço, assinatura
- Suporte a categorias com ícone, descrição e ordenação
- Possibilidade de múltiplas categorias por produto no futuro (tagging)

 Categorias Principais:
🎮 Jogos
👤 Contas
🔑 Keys / Códigos
📦 Assinaturas
🧰 Serviços Digitais
🎨 Itens Virtuais / Skins
🛒 Outros Produtos
🔽 Subcategorias (Exemplos por Categoria):
👤 Contas
Netflix
HBO Max
Disney+
Spotify
Game Pass
Instagram / TikTok
🔑 Keys / Códigos
Steam Key
Xbox Live Key
PSN Code
Gift Card Google Play
Cartões Pré-pagos
📦 Assinaturas
1 Dia
1 Semana
1 Mês
Lifetime
Licença Mensal
🧰 Serviços Digitais
Boost (CS:GO, Valorant, etc.)
Design Gráfico
Edição de Vídeo
Configuração Técnica
Instalação de Software
🎮 Jogos
CS:GO
Dota 2
Fortnite
GTA V
Call of Duty
🎨 Skins
CS:GO Skins
Dota 2 Skins
Rust Items
TF2 Skins
Steam Items
🛒 Outros
Templates
Packs personalizados
Bots / Macros
Scripts

 Sistema de Categorias (com Subcategorias)
- Estrutura hierárquica com categorias principais e subcategorias
- Cadastro de categorias pelo painel admin
- Cada produto deve ter uma categoria e subcategoria
- URL amigável com slug (ex: /categoria/contas/netflix)
- Suporte a ícones e filtros no frontend
- Subcategorias carregadas dinamicamente no cadastro do anúncio
- Reutilizável para filtros, páginas, busca e organização geral


### 📦 Assinaturas:
- Venda de contas compartilhadas
- Gerenciamento de validade e alertas
- Campo para dados de acesso/garantia

## 👤 Usuário:
- Cadastro/Steam Login
- Criar anúncios de qualquer categoria
- Wallet com histórico de vendas/compras
- Receber via Pix manual ou automático
- Avaliar outros usuários

## 🛡️ Segurança e Anti-Fraude:
- Sistema de denúncias com envio de provas
- Modo escrow (segura o pagamento até a entrega)
- Notificações automáticas por e-mail ou sistema
- Moderação manual (com painel admin)

## 📊 Admin:
- Dashboard de anúncios, vendas, usuários
- Banir usuários, remover anúncios
- Ver e julgar denúncias
- Gerenciar saques e aprovações

## 🎨 Estilo Visual:
- Tema escuro, moderno, inspirado em sites gamer (GGMAX, DMarket, Skinport)
- Ícones animados, efeitos de hover, cards chamativos
- Totalmente responsivo## 🔐 Multi-Vendedor
- Cada usuário é um vendedor
- Perfil público com foto, descrição, avaliações
- Gerencia seus anúncios, vendas, perguntas e saldo
- Recebe pagamento por vendas (Pix ou saldo interno)

## 💬 Funcionalidades Chave:

### Produtos:
- Cadastrar produto com tipo (skin, conta, key, serviço, assinatura)
- Upload de imagens/provas
- Preço, garantia, descrição
- Filtros por tipo, jogo, faixa de preço, vendedor, avaliação

### Avaliações:
- Após cada compra, o comprador avalia o vendedor
- 1–5 estrelas + comentário
- Exibidas no perfil e no anúncio

### Perguntas nos Anúncios:
- Usuários logados podem perguntar no anúncio
- Vendedor responde
- Thread visível no final da página do produto

### Chat Privado (pós-compra):
- Liberado após a compra ser finalizada
- Tempo limitado (ex: 3 dias)
- Realtime, estilo WhatsApp, com notificação
- Pode trocar arquivos, links e mensagens

### Wallet do Vendedor:
- Acompanhar vendas
- Solicitar saque via Pix
- Histórico completo de vendas e compras

## Admin:
- Painel com controle de:
  - Anúncios (aprovados, pendentes, bloqueados)
  - Usuários e vendedores
  - Avaliações
  - Perguntas com abuso
  - Relatórios de bugs/fraudes
- Ações rápidas: bloquear, aprovar, remover, destacar

## Design UI:
- Tema escuro
- Estilo gamer/futurista
- Inspiração: GGMAX, DMarket, 21st.dev
- Cards animados, hover, glassmorphism
- Layout responsivo mobile-first

## Extras:
- API pública (REST ou GraphQL)
- SEO básico (Next.js)
- Sistema de cupons
- PWA habilitado

## Nome do Projeto: **DIGITALDROP.gg**
- Slogan: "Skins, Contas, Serviços. Tudo num só drop."


Stack desejada — BACKEND
Linguagem: TypeScript

Framework: Next.js App Router (API routes) ou NestJS

ORM: Prisma (PostgreSQL)

Auth: JWT com suporte a 2FA (Google Authenticator)

Armazenamento de arquivos: AWS S3 ou local

Mensageria / Tempo real: Socket.IO ou Pusher

Notificações: WebSocket + Banco (armazenadas)

Integrações externas: Steam API (para bots) + Gateway de Pagamento

🧱 MODELOS PRINCIPAIS DO BANCO DE DADOS
ts
Copiar
Editar
// Usuário
User {
  id
  name
  email
  password
  isVerified
  twoFAEnabled
  balance
  totalSales
  totalPurchases
  documentUrl
  reputation
  isBanned
  isAdmin
  createdAt
}

// Produto
Product {
  id
  title
  description
  categoryId
  subcategoryId
  sellerId
  price
  durationType (day/week/month/lifetime)
  deliveryType (automatic/manual/bot)
  stock
  fileUrl (para entrega automática)
  steamItemInfo (opcional)
  status (active/pending/blocked)
  createdAt
}

// Pedido
Order {
  id
  buyerId
  productId
  sellerId
  status (pending/paid/delivered/dispute/resolved)
  deliveryContent (texto, arquivo, login, etc.)
  createdAt
}

// Disputa
Dispute {
  id
  orderId
  openedBy (buyer/seller)
  messages[]
  status (open/waiting/resolved)
  resolution (refund/confirm)
  evidenceUrls[]
}

// Chat Compra
OrderChat {
  id
  orderId
  senderId
  message
  createdAt
}

// Categoria
Category {
  id
  name
  slug
  parentId
}

// Avaliação
Review {
  id
  orderId
  rating
  comment
  buyerId
  sellerId
}

// Saques
Withdrawal {
  id
  userId
  amount
  status (pending/approved/denied)
  pixKey
  createdAt
}

// Transações
Transaction {
  id
  userId
  type (deposit/withdrawal/purchase/sale/commission)
  amount
  reference
  createdAt
}

// Notificações
Notification {
  id
  userId
  type (sale, message, dispute, question, delivery)
  content
  read
  createdAt
}
🔐 FUNCIONALIDADES ESSENCIAIS
Auth
Registro com e-mail/senha

Login com JWT

Google Authenticator (2FA)

Middleware de proteção por role (admin, vendedor, etc.)

Usuário
Atualizar perfil

Verificar identidade (upload RG/CNH)

Ativar/desativar 2FA

Visualizar reputação e vendas

🛒 Produtos
CRUD completo de produtos (restrito ao vendedor)

Upload de entregas automáticas (texto, arquivo, login)

Escolher duração do produto (1 dia, 1 mês, lifetime)

Categorias e subcategorias dinâmicas

Preço por variação de tipo (Ex: Conta Pro / Elite)

💳 Pagamentos
Gerar QRCode Pix com tempo de expiração

Receber via cartão (Stripe/PayPal)

Creditar saldo na carteira do usuário

Criar ordem de pagamento e conciliar transação

💸 Carteira e Saques
Adicionar saldo via Pix/cartão

Solicitar saque via chave Pix

Histórico de transações

Painel admin para aprovar/rejeitar saques

📦 Pedidos e Entrega
Criar pedido após pagamento

Entrega automática se deliveryType = automatic

Se for Steam Skin, transferir via bot (via Steam API)

Atualizar status: pendente > pago > entregue

Histórico de pedidos por usuário

🚨 Disputas
Abertura de disputa por comprador

Sistema de mensagens entre vendedor e comprador

Envio de provas (imagens, prints)

Staff media disputa e define resultado

Ações: reembolso, liberação, bloqueio

💬 Comunicação
Chat pós-compra privado

Notificação por WebSocket ao receber mensagem

Perguntas e respostas públicas nos anúncios

🛠️ Admin Panel
Banir/ativar usuário

Moderar anúncios

Verificar documentos

Ver disputas abertas

Ver comissões e transações

Criar categorias e subcategorias

📊 Painéis
Vendedor
Total vendido

Produtos mais vendidos

Avaliações recebidas

Saldo atual

Admin
Faturamento da plataforma

Vendas por categoria

Produtos pendentes

Reclamações abertas

🧠 Extras
Sistema de favoritos

Histórico de compras/vendas

Destaque de anúncio pago

Push Notifications (via WS)

Modo Dark/Light (se for fullstack)

⚡ Considerações técnicas
API REST ou GraphQL com autenticação JWT

Rate limiting por IP para evitar spam

Logs de atividade (opcional)

Upload via S3 (ou local dev)

Proteção contra injeção, XSS, CSRF

