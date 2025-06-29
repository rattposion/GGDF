import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createError, successResponse } from '../../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    const { id } = params
    const body = await request.json()
    const { answer } = body
    if (!answer) {
      return NextResponse.json(createError('Resposta obrigatória', 400), { status: 400 })
    }
    // Só o vendedor do produto pode responder
    const question = await prisma.question.findUnique({ where: { id }, include: { product: true } })
    if (!question || question.product.userId !== session.user.id) {
      return NextResponse.json(createError('Sem permissão para responder', 403), { status: 403 })
    }
    const updated = await prisma.question.update({ where: { id }, data: { answer, answeredBy: session.user.id, answeredAt: new Date() } })
    return NextResponse.json(successResponse(updated, 'Pergunta respondida'), { status: 200 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao responder pergunta', 500), { status: 500 })
  }
} 