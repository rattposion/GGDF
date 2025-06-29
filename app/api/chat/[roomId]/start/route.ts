import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createError, successResponse, logActivity } from '../../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createError('Usuário não autenticado', 401),
        { status: 401 }
      )
    }

    const { roomId } = params
    const body = await request.json()
    const { message } = body

    // Buscar o chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        order: {
          include: {
            buyer: { select: { id: true, username: true } },
            seller: { select: { id: true, username: true } },
            product: { select: { id: true, title: true } }
          }
        },
        messages: {
          include: {
            user: { select: { id: true, username: true, avatar: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!chatRoom) {
      return NextResponse.json(
        createError('Chat room não encontrado', 404),
        { status: 404 }
      )
    }

    // Verificar se o usuário tem permissão para acessar este chat
    if (chatRoom.buyerId !== session.user.id && chatRoom.sellerId !== session.user.id) {
      return NextResponse.json(
        createError('Acesso negado', 403),
        { status: 403 }
      )
    }

    // Verificar se o chat não expirou
    if (chatRoom.expiresAt && chatRoom.expiresAt < new Date()) {
      return NextResponse.json(
        createError('Chat expirado', 400),
        { status: 400 }
      )
    }

    // Se uma mensagem foi enviada, criar a mensagem
    let newMessage = null
    if (message && message.trim()) {
      newMessage = await prisma.chatMessage.create({
        data: {
          chatRoomId: roomId,
          userId: session.user.id,
          content: message.trim(),
          type: 'TEXT'
        },
        include: {
          user: { select: { id: true, username: true, avatar: true } }
        }
      })

      // Log da atividade
      await logActivity(session.user.id, 'CHAT_MESSAGE_SENT', 'chat', { 
        roomId, 
        messageId: newMessage.id 
      })
    }

    // Retornar dados do chat
    return NextResponse.json(
      successResponse({
        chatRoom: {
          id: chatRoom.id,
          status: chatRoom.status,
          expiresAt: chatRoom.expiresAt,
          order: {
            id: chatRoom.order.id,
            amount: chatRoom.order.amount,
            status: chatRoom.order.status,
            product: {
              id: chatRoom.order.product.id,
              title: chatRoom.order.product.title
            },
            buyer: chatRoom.order.buyer,
            seller: chatRoom.order.seller
          },
          messages: chatRoom.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            type: msg.type,
            fileUrl: msg.fileUrl,
            read: msg.read,
            createdAt: msg.createdAt,
            user: msg.user
          }))
        },
        newMessage: newMessage ? {
          id: newMessage.id,
          content: newMessage.content,
          type: newMessage.type,
          fileUrl: newMessage.fileUrl,
          read: newMessage.read,
          createdAt: newMessage.createdAt,
          user: newMessage.user
        } : null
      }, 'Chat iniciado com sucesso'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao iniciar chat:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createError('Usuário não autenticado', 401),
        { status: 401 }
      )
    }

    const { roomId } = params

    // Buscar o chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        order: {
          include: {
            buyer: { select: { id: true, username: true } },
            seller: { select: { id: true, username: true } },
            product: { select: { id: true, title: true } }
          }
        },
        messages: {
          include: {
            user: { select: { id: true, username: true, avatar: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!chatRoom) {
      return NextResponse.json(
        createError('Chat room não encontrado', 404),
        { status: 404 }
      )
    }

    // Verificar se o usuário tem permissão para acessar este chat
    if (chatRoom.buyerId !== session.user.id && chatRoom.sellerId !== session.user.id) {
      return NextResponse.json(
        createError('Acesso negado', 403),
        { status: 403 }
      )
    }

    // Marcar mensagens como lidas
    await prisma.chatMessage.updateMany({
      where: {
        chatRoomId: roomId,
        userId: { not: session.user.id },
        read: false
      },
      data: { read: true }
    })

    return NextResponse.json(
      successResponse({
        chatRoom: {
          id: chatRoom.id,
          status: chatRoom.status,
          expiresAt: chatRoom.expiresAt,
          order: {
            id: chatRoom.order.id,
            amount: chatRoom.order.amount,
            status: chatRoom.order.status,
            product: {
              id: chatRoom.order.product.id,
              title: chatRoom.order.product.title
            },
            buyer: chatRoom.order.buyer,
            seller: chatRoom.order.seller
          },
          messages: chatRoom.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            type: msg.type,
            fileUrl: msg.fileUrl,
            read: msg.read,
            createdAt: msg.createdAt,
            user: msg.user
          }))
        }
      }, 'Chat carregado com sucesso'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao carregar chat:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
} 