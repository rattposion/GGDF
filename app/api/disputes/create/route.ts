import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { createError, successResponse } from '../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    
    const body = await request.json()
    const { orderId, reason } = body
    
    if (!orderId || !reason) {
      return NextResponse.json(createError('ID do pedido e motivo são obrigatórios', 400), { status: 400 })
    }
    
    // Verifica se o usuário faz parte do pedido
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || (order.buyerId !== session.user.id && order.sellerId !== session.user.id)) {
      return NextResponse.json(createError('Sem permissão para abrir disputa', 403), { status: 403 })
    }
    
    // Só pode abrir uma disputa por pedido
    const existing = await prisma.dispute.findUnique({ where: { orderId: orderId } })
    if (existing) {
      return NextResponse.json(createError('Disputa já aberta para este pedido', 400), { status: 400 })
    }
    
    const dispute = await prisma.dispute.create({ 
      data: { 
        orderId: orderId, 
        userId: session.user.id, 
        reason, 
        status: 'OPEN' 
      } 
    })
    
    return NextResponse.json(successResponse(dispute, 'Disputa aberta'), { status: 201 })
  } catch (error) {
    console.error('Erro ao criar disputa:', error)
    return NextResponse.json(createError('Erro ao abrir disputa', 500), { status: 500 })
  }
} 