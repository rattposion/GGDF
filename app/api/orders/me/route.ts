import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { createError, successResponse, paginateResults } from '../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createError('Usuário não autenticado', 401),
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const role = searchParams.get('role') || 'buyer' // 'buyer' ou 'seller'
    
    // Construir filtros
    const where: any = {}
    
    if (role === 'buyer') {
      where.buyerId = session.user.id
    } else if (role === 'seller') {
      where.sellerId = session.user.id
    } else {
      // Buscar como comprador e vendedor
      where.OR = [
        { buyerId: session.user.id },
        { sellerId: session.user.id }
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    // Buscar pedidos
    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            avatar: true,
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            avatar: true,
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            type: true,
            images: {
              take: 1,
              orderBy: { order: 'asc' },
            }
          }
        },
        variation: {
          select: {
            id: true,
            name: true,
            price: true,
          }
        },
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          }
        },
        delivery: {
          select: {
            id: true,
            type: true,
            status: true,
            deliveredAt: true,
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
          }
        },
        chatRoom: {
          select: {
            id: true,
            status: true,
            expiresAt: true,
          }
        },
        dispute: {
          select: {
            id: true,
            status: true,
            reason: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Paginar resultados
    const paginatedResults = paginateResults(orders, page, limit)
    
    // Formatar dados para resposta
    const formattedOrders = paginatedResults.data.map((order: any) => ({
      id: order.id,
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      deliveredAt: order.deliveredAt,
      completedAt: order.completedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      
      // Informações do comprador/vendedor
      buyer: {
        id: order.buyer.id,
        username: order.buyer.username,
        avatar: order.buyer.avatar,
      },
      seller: {
        id: order.seller.id,
        username: order.seller.username,
        avatar: order.seller.avatar,
      },
      
      // Informações do produto
      product: {
        id: order.product.id,
        title: order.product.title,
        type: order.product.type,
        image: order.product.images[0]?.url,
      },
      
      // Variação selecionada (se houver)
      variation: order.variation ? {
        id: order.variation.id,
        name: order.variation.name,
        price: order.variation.price,
      } : null,
      
      // Plano de assinatura selecionado (se houver)
      subscriptionPlan: order.subscriptionPlan ? {
        id: order.subscriptionPlan.id,
        name: order.subscriptionPlan.name,
        price: order.subscriptionPlan.price,
        duration: order.subscriptionPlan.duration,
      } : null,
      
      // Informações de entrega
      delivery: order.delivery ? {
        id: order.delivery.id,
        type: order.delivery.type,
        status: order.delivery.status,
        deliveredAt: order.delivery.deliveredAt,
      } : null,
      
      // Avaliação (se houver)
      review: order.review ? {
        id: order.review.id,
        rating: order.review.rating,
        comment: order.review.comment,
      } : null,
      
      // Chat (se houver)
      chat: order.chatRoom ? {
        id: order.chatRoom.id,
        status: order.chatRoom.status,
        expiresAt: order.chatRoom.expiresAt,
      } : null,
      
      // Disputa (se houver)
      dispute: order.dispute ? {
        id: order.dispute.id,
        status: order.dispute.status,
        reason: order.dispute.reason,
      } : null,
      
      // Determinar se o usuário é comprador ou vendedor neste pedido
      userRole: order.buyerId === session.user.id ? 'buyer' : 'seller',
    }))
    
    return NextResponse.json(
      successResponse({
        orders: formattedOrders,
        pagination: paginatedResults.pagination,
      }),
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      createError('Erro ao buscar pedidos', 500),
      { status: 500 }
    )
  }
} 