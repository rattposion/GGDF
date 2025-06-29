import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

export function initSocket(server: any) {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token não fornecido'));
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      (socket as any).user = user;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    // Chat privado
    socket.on('chat:join', (roomId) => {
      socket.join(roomId);
    });
    socket.on('chat:send', ({ roomId, message }) => {
      io?.to(roomId).emit('chat:message', { user: (socket as any).user, message });
    });
    // Notificações
    socket.on('notification:subscribe', (userId) => {
      socket.join(`notif:${userId}`);
    });
    // Emitir notificação
    socket.on('notification:new', ({ userId, notification }) => {
      io?.to(`notif:${userId}`).emit('notification', notification);
    });
    // Pedidos
    socket.on('order:update', (data) => {
      io?.emit('order:update', data);
    });
    // Disputas
    socket.on('dispute:new', (data) => {
      io?.emit('dispute:new', data);
    });
    // Admin
    socket.on('admin:alert', (data) => {
      io?.emit('admin:alert', data);
    });
  });

  return io;
} 