import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createError, successResponse } from '../../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const { orderId } = params
    // Verifica se o usuário faz parte do pedido
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || (order.buyerId !== session.user.id && order.sellerId !== session.user.id)) {
      return NextResponse.json(createError('Sem permissão para iniciar chat', 403), { status: 403 })
    }
    // Cria ou retorna chat
    let chat = await prisma.chatRoom.findUnique({ where: { orderId } })
    if (!chat) {
      chat = await prisma.chatRoom.create({ data: { orderId, buyerId: order.buyerId, sellerId: order.sellerId, status: 'ACTIVE', expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } })
    }
    return NextResponse.json(successResponse(chat, 'Chat iniciado'), { status: 201 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao iniciar chat', 500), { status: 500 })
  }
} 