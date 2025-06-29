import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { prisma } from './prisma'
// import { verifyToken } from './utils'

// Interface para mensagem de chat
interface ChatMessage {
  id: string
  chatRoomId: string
  userId: string
  content: string
  type: 'TEXT' | 'FILE' | 'LINK' | 'IMAGE'
  fileUrl?: string
  createdAt: Date
  user: {
    id: string
    username: string
    avatar?: string
  }
}

// Interface para notificação
interface Notification {
  id: string
  userId: string
  title: string
  content: string
  type: string
  link?: string
  createdAt: Date
}

// Configurar Socket.IO
export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Token não fornecido'))
      }

      // const decoded = verifyToken(token)
      // if (!decoded) {
      //   return next(new Error('Token inválido'))
      // }

      // socket.data.user = decoded
      socket.data.user = { id: 'temp-user-id' } // Temporário
      next()
    } catch (error) {
      next(new Error('Erro de autenticação'))
    }
  })

  // Conexão estabelecida
  io.on('connection', (socket) => {
    const userId = socket.data.user.id
    console.log(`Usuário ${userId} conectado`)

    // Entrar na sala de notificações do usuário
    socket.join(`notifications:${userId}`)

    // Entrar em salas de chat ativas
    joinActiveChats(socket, userId)

    // Evento: Enviar mensagem no chat
    socket.on('chat:send', async (data: { chatRoomId: string; content: string; type?: string }) => {
      try {
        const { chatRoomId, content, type = 'TEXT' } = data

        // Verificar se o usuário faz parte do chat
        const chatRoom = await prisma.chatRoom.findUnique({
          where: { id: chatRoomId },
          include: { buyer: true, seller: true }
        })

        if (!chatRoom || (chatRoom.buyerId !== userId && chatRoom.sellerId !== userId)) {
          socket.emit('error', 'Sem permissão para enviar mensagem neste chat')
          return
        }

        // Criar mensagem no banco
        const message = await prisma.chatMessage.create({
          data: {
            chatRoomId,
            userId,
            content,
            type: type as any,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            }
          }
        })

        // Enviar mensagem para todos os participantes do chat
        const chatMessage: ChatMessage = {
          id: message.id,
          chatRoomId: message.chatRoomId,
          userId: message.userId,
          content: message.content,
          type: message.type as any,
          fileUrl: message.fileUrl || undefined,
          createdAt: message.createdAt,
          user: {
            id: message.user.id,
            username: message.user.username,
            avatar: message.user.avatar || undefined,
          }
        }

        io.to(`chat:${chatRoomId}`).emit('chat:message', chatMessage)

      } catch (error) {
        console.error('Erro ao enviar mensagem:', error)
        socket.emit('error', 'Erro ao enviar mensagem')
      }
    })

    // Evento: Marcar mensagem como lida
    socket.on('chat:read', async (data: { chatRoomId: string; messageIds: string[] }) => {
      try {
        const { chatRoomId, messageIds } = data

        // Verificar permissão
        const chatRoom = await prisma.chatRoom.findUnique({
          where: { id: chatRoomId }
        })

        if (!chatRoom || (chatRoom.buyerId !== userId && chatRoom.sellerId !== userId)) {
          return
        }

        // Marcar mensagens como lidas
        await prisma.chatMessage.updateMany({
          where: {
            id: { in: messageIds },
            chatRoomId,
            userId: { not: userId }, // Não marcar próprias mensagens
            read: false
          },
          data: { read: true }
        })

        // Notificar outros participantes
        socket.to(`chat:${chatRoomId}`).emit('chat:read', {
          chatRoomId,
          messageIds,
          readBy: userId
        })

      } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error)
      }
    })

    // Evento: Entrar em sala de chat
    socket.on('chat:join', async (chatRoomId: string) => {
      try {
        const chatRoom = await prisma.chatRoom.findUnique({
          where: { id: chatRoomId }
        })

        if (chatRoom && (chatRoom.buyerId === userId || chatRoom.sellerId === userId)) {
          socket.join(`chat:${chatRoomId}`)
          socket.emit('chat:joined', chatRoomId)
        }
      } catch (error) {
        console.error('Erro ao entrar no chat:', error)
      }
    })

    // Evento: Sair de sala de chat
    socket.on('chat:leave', (chatRoomId: string) => {
      socket.leave(`chat:${chatRoomId}`)
      socket.emit('chat:left', chatRoomId)
    })

    // Evento: Marcar notificação como lida
    socket.on('notification:read', async (notificationId: string) => {
      try {
        await prisma.notification.update({
          where: {
            id: notificationId,
            userId: userId
          },
          data: { read: true }
        })

        socket.emit('notification:read', notificationId)
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error)
      }
    })

    // Desconexão
    socket.on('disconnect', () => {
      console.log(`Usuário ${userId} desconectado`)
    })
  })

  return io
}

// Função para entrar em chats ativos do usuário
async function joinActiveChats(socket: any, userId: string) {
  try {
    const activeChats = await prisma.chatRoom.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ],
        status: 'ACTIVE'
      },
      select: { id: true }
    })

    activeChats.forEach(chat => {
      socket.join(`chat:${chat.id}`)
    })
  } catch (error) {
    console.error('Erro ao entrar em chats ativos:', error)
  }
}

// Função para enviar notificação em tempo real
export async function sendNotification(io: any, userId: string, notification: Notification) {
  try {
    io.to(`notifications:${userId}`).emit('notification:new', notification)
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
  }
}

// Função para enviar mensagem de chat em tempo real
export async function sendChatMessage(io: any, chatRoomId: string, message: ChatMessage) {
  try {
    io.to(`chat:${chatRoomId}`).emit('chat:message', message)
  } catch (error) {
    console.error('Erro ao enviar mensagem de chat:', error)
  }
}

// Função para notificar sobre mudança de status de pedido
export async function notifyOrderStatusChange(io: any, orderId: string, status: string, userId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { id: true, username: true } },
        seller: { select: { id: true, username: true } },
        product: { select: { title: true } }
      }
    })

    if (!order) return

    // Notificar comprador
    if (order.buyerId !== userId) {
      io.to(`notifications:${order.buyerId}`).emit('order:status_change', {
        orderId,
        status,
        productTitle: order.product.title
      })
    }

    // Notificar vendedor
    if (order.sellerId !== userId) {
      io.to(`notifications:${order.sellerId}`).emit('order:status_change', {
        orderId,
        status,
        productTitle: order.product.title
      })
    }
  } catch (error) {
    console.error('Erro ao notificar mudança de status:', error)
  }
} 