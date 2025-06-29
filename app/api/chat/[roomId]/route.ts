import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createError, successResponse } from '../../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const { roomId } = params
    // Verifica se o usuário faz parte do chat
    const chat = await prisma.chatRoom.findUnique({ where: { id: roomId } })
    if (!chat || (chat.buyerId !== session.user.id && chat.sellerId !== session.user.id)) {
      return NextResponse.json(createError('Sem permissão para ver o chat', 403), { status: 403 })
    }
    const messages = await prisma.chatMessage.findMany({ where: { chatRoomId: roomId }, orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, username: true, avatar: true } } } })
    return NextResponse.json(successResponse(messages), { status: 200 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao buscar mensagens', 500), { status: 500 })
  }
} 