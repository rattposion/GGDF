import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createError, successResponse } from '../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!productId) {
      return NextResponse.json(
        createError('ID do produto é obrigatório', 400),
        { status: 400 }
      )
    }

    const questions = await prisma.question.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        answeredByUser: { select: { id: true, username: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.question.count({
      where: { productId }
    })

    return NextResponse.json(
      successResponse({
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }, 'Perguntas carregadas com sucesso'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao carregar perguntas:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        createError('Usuário não autenticado', 401),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, question } = body

    if (!productId || !question) {
      return NextResponse.json(
        createError('ID do produto e pergunta são obrigatórios', 400),
        { status: 400 }
      )
    }

    const newQuestion = await prisma.question.create({
      data: {
        productId,
        userId: session.user.id as string,
        question: question.trim()
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } }
      }
    })

    return NextResponse.json(
      successResponse(newQuestion, 'Pergunta criada com sucesso'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao criar pergunta:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
} 