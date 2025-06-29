import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createError, successResponse, logActivity } from '../../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createError('Usuário não autenticado', 401),
        { status: 401 }
      )
    }

    const { disputeId } = params
    const userId = session.user.id as string
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        createError('Conteúdo da mensagem é obrigatório', 400),
        { status: 400 }
      )
    }

    // Verificar se a disputa existe e se o usuário tem permissão
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { order: true }
    })

    if (!dispute) {
      return NextResponse.json(
        createError('Disputa não encontrada', 404),
        { status: 404 }
      )
    }

    // Verificar se o usuário tem permissão para enviar mensagens nesta disputa
    if (dispute.userId !== userId && 
        dispute.order.buyerId !== userId && 
        dispute.order.sellerId !== userId) {
      return NextResponse.json(
        createError('Acesso negado', 403),
        { status: 403 }
      )
    }

    // Criar a mensagem
    const message = await prisma.disputeMessage.create({
      data: {
        disputeId,
        userId,
        content: content.trim()
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } }
      }
    })

    // Log da atividade
    await logActivity(userId, 'DISPUTE_MESSAGE_SENT', 'dispute', { 
      disputeId, 
      messageId: message.id 
    })

    return NextResponse.json(
      successResponse(message, 'Mensagem enviada com sucesso'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createError('Usuário não autenticado', 401),
        { status: 401 }
      )
    }

    const { disputeId } = params
    const userId = session.user.id as string

    // Verificar se a disputa existe e se o usuário tem permissão
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { order: true }
    })

    if (!dispute) {
      return NextResponse.json(
        createError('Disputa não encontrada', 404),
        { status: 404 }
      )
    }

    // Verificar se o usuário tem permissão para ver mensagens desta disputa
    if (dispute.userId !== userId && 
        dispute.order.buyerId !== userId && 
        dispute.order.sellerId !== userId) {
      return NextResponse.json(
        createError('Acesso negado', 403),
        { status: 403 }
      )
    }

    // Buscar mensagens da disputa
    const messages = await prisma.disputeMessage.findMany({
      where: { disputeId },
      include: {
        user: { select: { id: true, username: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(
      successResponse(messages, 'Mensagens carregadas com sucesso'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao carregar mensagens:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
} 