import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createError, successResponse, paginateResults } from '../../../lib/utils'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de busca e filtros
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const subcategoryId = searchParams.get('subcategoryId') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const featured = searchParams.get('featured') === 'true'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Construir filtros
    const where: any = {
      status: 'ACTIVE',
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (subcategoryId) {
      where.subcategoryId = subcategoryId
    }
    
    if (minPrice > 0 || maxPrice < 999999) {
      where.price = {
        gte: minPrice,
        lte: maxPrice,
      }
    }
    
    if (minRating > 0) {
      where.rating = {
        gte: minRating,
      }
    }
    
    if (featured) {
      where.featured = true
    }
    
    // Construir ordenação
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder
    
    // Buscar produtos
    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            reputation: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        variations: true,
        subscriptionPlans: true,
        _count: {
          select: {
            reviews: true,
            questions: true,
          }
        }
      },
    })
    
    // Paginar resultados
    const paginatedResults = paginateResults(products, page, limit)
    
    // Formatar dados para resposta
    const formattedProducts = paginatedResults.data.map((product: any) => ({
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
      views: product.views,
      favorites: product.favorites,
      rating: product.rating,
      reviewCount: product._count.reviews,
      questionCount: product._count.questions,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      seller: {
        id: product.user.id,
        username: product.user.username,
        avatar: product.user.avatar,
        reputation: product.user.reputation,
      },
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      subcategory: product.subcategory ? {
        id: product.subcategory.id,
        name: product.subcategory.name,
        slug: product.subcategory.slug,
      } : null,
      images: product.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
      })),
      variations: product.variations.map((variation: any) => ({
        id: variation.id,
        name: variation.name,
        description: variation.description,
        price: variation.price,
        stock: variation.stock,
      })),
      subscriptionPlans: product.subscriptionPlans.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
      })),
    }))
    
    return NextResponse.json(
      successResponse({
        products: formattedProducts,
        pagination: paginatedResults.pagination,
      }),
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      createError('Erro ao buscar produtos', 500),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const body = await request.json()
    // TODO: Adicionar validação completa e upload seguro
    const { title, description, price, type, categoryId, subcategoryId, guarantee, autoDelivery, deliveryType, stock, featured, validity } = body
    if (!title || !description || !price || !type || !categoryId || !guarantee) {
      return NextResponse.json(createError('Campos obrigatórios faltando', 400), { status: 400 })
    }
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        title, description, price, type, categoryId, subcategoryId, guarantee, autoDelivery, deliveryType, stock, featured, validity,
        status: 'PENDING',
      }
    })
    return NextResponse.json(successResponse(product, 'Produto criado com sucesso'), { status: 201 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao criar produto', 500), { status: 500 })
  }
} 