import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createError, successResponse } from '../../../lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    
    // Construir filtros
    const where: any = {}
    if (featured) {
      where.featured = true
    }
    
    // Buscar categorias com subcategorias
    const categories = await prisma.category.findMany({
      where,
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            products: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' }
      ]
    })
    
    // Formatar dados para resposta
    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      featured: category.featured,
      productCount: category._count.products,
      subcategories: category.subcategories.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        icon: sub.icon,
      })),
    }))
    
    return NextResponse.json(
      successResponse(formattedCategories),
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      createError('Erro ao buscar categorias', 500),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implementar criação de categoria (admin only)
    return NextResponse.json(
      createError('Método não implementado', 501),
      { status: 501 }
    )
  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
} 