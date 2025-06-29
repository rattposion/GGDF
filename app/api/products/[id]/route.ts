import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { createError, successResponse } from '../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Buscar produto com todas as informações
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            reputation: true,
            verified: true,
            createdAt: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          }
        },
        images: {
          orderBy: { order: 'asc' },
        },
        variations: {
          orderBy: { createdAt: 'asc' },
        },
        subscriptionPlans: {
          orderBy: { price: 'asc' },
        },
        reviews: {
          include: {
            buyer: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        questions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            },
            answeredByUser: {
              select: {
                id: true,
                username: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        steamItem: {
          select: {
            id: true,
            name: true,
            marketName: true,
            type: true,
            rarity: true,
            quality: true,
            game: true,
            iconUrl: true,
            imageUrl: true,
            float: true,
            wear: true,
            estimatedPrice: true,
            tradable: true,
            marketable: true,
            inCustody: true,
          }
        },
        _count: {
          select: {
            reviews: true,
            questions: true,
            orders: true,
          }
        }
      }
    })
    
    if (!product) {
      return NextResponse.json(
        createError('Produto não encontrado', 404),
        { status: 404 }
      )
    }
    
    // Incrementar visualizações
    await prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } }
    })
    
    // Formatar dados para resposta
    const formattedProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      type: product.type,
      status: product.status,
      autoDelivery: product.autoDelivery,
      deliveryType: product.deliveryType,
      stock: product.stock,
      featured: product.featured,
      validity: product.validity,
      steamCustody: product.steamCustody,
      views: product.views + 1, // +1 porque acabamos de incrementar
      favorites: product.favorites,
      rating: product.rating,
      reviewCount: product._count.reviews,
      questionCount: product._count.questions,
      orderCount: product._count.orders,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      
      seller: {
        id: product.user.id,
        username: product.user.username,
        avatar: product.user.avatar,
        reputation: product.user.reputation,
        verified: product.user.verified,
        memberSince: product.user.createdAt,
      },
      
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        icon: product.category.icon,
      },
      
      subcategory: product.subcategory ? {
        id: product.subcategory.id,
        name: product.subcategory.name,
        slug: product.subcategory.slug,
        icon: product.subcategory.icon,
      } : null,
      
      images: product.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        order: img.order,
      })),
      
      variations: product.variations.map((variation: any) => ({
        id: variation.id,
        name: variation.name,
        description: variation.description,
        price: variation.price,
        stock: variation.stock,
        createdAt: variation.createdAt,
      })),
      
      subscriptionPlans: product.subscriptionPlans.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        createdAt: plan.createdAt,
      })),
      
      reviews: product.reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        sellerReply: review.sellerReply,
        sellerRepliedAt: review.sellerRepliedAt,
        helpful: review.helpful,
        verified: review.verified,
        createdAt: review.createdAt,
        buyer: {
          id: review.buyer.id,
          username: review.buyer.username,
          avatar: review.buyer.avatar,
        }
      })),
      
      questions: product.questions.map((question: any) => ({
        id: question.id,
        question: question.question,
        answer: question.answer,
        answeredAt: question.answeredAt,
        createdAt: question.createdAt,
        user: {
          id: question.user.id,
          username: question.user.username,
          avatar: question.user.avatar,
        },
        answeredBy: question.answeredByUser ? {
          id: question.answeredByUser.id,
          username: question.answeredByUser.username,
          avatar: question.answeredByUser.avatar,
        } : null,
      })),
      
      steamItem: product.steamItem ? {
        id: product.steamItem.id,
        name: product.steamItem.name,
        marketName: product.steamItem.marketName,
        type: product.steamItem.type,
        rarity: product.steamItem.rarity,
        quality: product.steamItem.quality,
        game: product.steamItem.game,
        iconUrl: product.steamItem.iconUrl,
        imageUrl: product.steamItem.imageUrl,
        float: product.steamItem.float,
        wear: product.steamItem.wear,
        estimatedPrice: product.steamItem.estimatedPrice,
        tradable: product.steamItem.tradable,
        marketable: product.steamItem.marketable,
        inCustody: product.steamItem.inCustody,
      } : null,
    }
    
    return NextResponse.json(
      successResponse(formattedProduct),
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      createError('Erro ao buscar produto', 500),
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const { id } = params
    const body = await request.json()
    // Só permite atualizar produto do próprio vendedor
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product || product.userId !== session.user.id) {
      return NextResponse.json(createError('Produto não encontrado ou sem permissão', 403), { status: 403 })
    }
    const updated = await prisma.product.update({ where: { id }, data: body })
    return NextResponse.json(successResponse(updated, 'Produto atualizado'), { status: 200 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao atualizar produto', 500), { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const { id } = params
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product || product.userId !== session.user.id) {
      return NextResponse.json(createError('Produto não encontrado ou sem permissão', 403), { status: 403 })
    }
    await prisma.product.delete({ where: { id } })
    return NextResponse.json(successResponse(null, 'Produto excluído'), { status: 200 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao excluir produto', 500), { status: 500 })
  }
} 