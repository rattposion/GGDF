import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createError, successResponse } from '../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const body = await request.json()
    const { orderId, productId, sellerId, rating, comment } = body
    if (!orderId || !productId || !sellerId || !rating) {
      return NextResponse.json(createError('Campos obrigatórios faltando', 400), { status: 400 })
    }
    // Verifica se o usuário já avaliou esse pedido
    const existing = await prisma.review.findUnique({ where: { orderId } })
    if (existing) {
      return NextResponse.json(createError('Avaliação já enviada para este pedido', 400), { status: 400 })
    }
    // Cria avaliação
    const review = await prisma.review.create({
      data: {
        orderId, productId, sellerId, buyerId: session.user.id, rating, comment, verified: true
      }
    })
    return NextResponse.json(successResponse(review, 'Avaliação enviada'), { status: 201 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao enviar avaliação', 500), { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendedorId = searchParams.get('vendedorId')
    if (!vendedorId) {
      return NextResponse.json(createError('ID do vendedor é obrigatório', 400), { status: 400 })
    }
    const reviews = await prisma.review.findMany({
      where: { sellerId: vendedorId },
      include: {
        buyer: { select: { id: true, username: true, avatar: true } },
        product: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(successResponse(reviews), { status: 200 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao buscar avaliações', 500), { status: 500 })
  }
} 