import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import './steam';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import notificationRoutes from './routes/notification.routes';
import chatRoutes from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';
import steamRoutes from './routes/steam.routes';
import pixRoutes from './routes/pix.routes';
import favoriteRoutes from './routes/favorite.routes';
import highlightRoutes from './routes/highlight.routes';
import reportRoutes from './routes/report.routes';
import statsRoutes from './routes/stats.routes';
import feedbackRoutes from './routes/feedback.routes';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://ggdf-production.up.railway.app',
      'https://seu-dominio.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: [
    'http://localhost:5173', // Frontend local
    'https://seu-dominio.com', // Produção (ajuste para seu domínio real)
    'https://ggdf-production.up.railway.app' // Railway
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para não redirecionar requests OPTIONS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

// Middleware de redirecionamento para HTTPS (exceto OPTIONS)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

app.use(express.json());
app.use(session({ secret: process.env.JWT_SECRET || 'changeme', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('API Marketplace Online!');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/steam', steamRoutes);
app.use('/api/pix', pixRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// (as demais rotas serão adicionadas depois)

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Handlers de WebSocket para chat em tempo real
io.on('connection', (socket) => {
  // Entrar em uma sala específica do pedido
  socket.on('join', (orderId) => {
    socket.join(orderId);
  });

  // Receber mensagem do chat e repassar para todos na sala
  socket.on('chat:send', (data) => {
    // data: { orderId, message, type }
    // Aqui você pode salvar no banco se quiser (opcional)
    io.to(data.orderId).emit('chat:receive', {
      ...data,
      senderId: socket.handshake.auth?.userId || 'user', // ajuste conforme autenticação
      createdAt: new Date().toISOString(),
    });
  });

  // (Opcional) Desconectar
  socket.on('disconnect', () => {
    // console.log('Usuário desconectado');
  });
}); 