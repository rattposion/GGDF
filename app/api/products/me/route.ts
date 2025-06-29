import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { createError, successResponse, paginateResults } from '../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const where: any = { userId: session.user.id }
    if (status) where.status = status
    if (type) where.type = type
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        images: { orderBy: { order: 'asc' }, take: 1 },
        _count: { select: { orders: true, reviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    const paginated = paginateResults(products, page, limit)
    return NextResponse.json(successResponse({ products: paginated.data, pagination: paginated.pagination }), { status: 200 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao buscar produtos', 500), { status: 500 })
  }
} 