import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { createError, successResponse, logActivity } from '../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

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

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
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
            user: { select: { id: true, username: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!dispute) {
      return NextResponse.json(
        createError('Disputa não encontrada', 404),
        { status: 404 }
      )
    }

    // Verificar se o usuário tem permissão para ver esta disputa
    if (dispute.userId !== userId && 
        dispute.order.buyerId !== userId && 
        dispute.order.sellerId !== userId) {
      return NextResponse.json(
        createError('Acesso negado', 403),
        { status: 403 }
      )
    }

    return NextResponse.json(
      successResponse(dispute, 'Disputa carregada com sucesso'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao carregar disputa:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const userRole = (session.user as any).role
    const body = await request.json()
    const { status, resolution } = body

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

    // Apenas admins podem resolver disputas
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        createError('Apenas administradores podem resolver disputas', 403),
        { status: 403 }
      )
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: status || dispute.status,
        resolution: resolution || dispute.resolution,
        resolvedBy: userId,
        resolvedAt: new Date()
      }
    })

    // Log da atividade
    await logActivity(userId, 'DISPUTE_RESOLVED', 'dispute', { 
      disputeId, 
      status: updatedDispute.status 
    })

    return NextResponse.json(
      successResponse(updatedDispute, 'Disputa atualizada com sucesso'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao atualizar disputa:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
} 