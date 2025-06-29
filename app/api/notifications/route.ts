import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createError, successResponse } from '../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const notifications = await prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 50 })
    return NextResponse.json(successResponse(notifications), { status: 200 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao buscar notificações', 500), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const body = await request.json()
    const { notificationId } = body
    if (!notificationId) {
      return NextResponse.json(createError('ID da notificação é obrigatório', 400), { status: 400 })
    }
    await prisma.notification.update({ where: { id: notificationId, userId: session.user.id }, data: { read: true } })
    return NextResponse.json(successResponse(null, 'Notificação marcada como lida'), { status: 200 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao marcar notificação', 500), { status: 500 })
  }
} 