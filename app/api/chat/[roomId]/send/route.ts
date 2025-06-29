import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createError, successResponse } from '../../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const { roomId } = params
    const body = await request.json()
    const { content, type } = body
    if (!content) {
      return NextResponse.json(createError('Mensagem obrigatória', 400), { status: 400 })
    }
    // Verifica se o usuário faz parte do chat
    const chat = await prisma.chatRoom.findUnique({ where: { id: roomId } })
    if (!chat || (chat.buyerId !== session.user.id && chat.sellerId !== session.user.id)) {
      return NextResponse.json(createError('Sem permissão para enviar mensagem', 403), { status: 403 })
    }
    const message = await prisma.chatMessage.create({ data: { chatRoomId: roomId, userId: session.user.id, content, type: type || 'TEXT' } })
    return NextResponse.json(successResponse(message, 'Mensagem enviada'), { status: 201 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao enviar mensagem', 500), { status: 500 })
  }
} 