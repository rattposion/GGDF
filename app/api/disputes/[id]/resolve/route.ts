import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { createError, successResponse } from '../../../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(createError('Acesso restrito ao admin', 403), { status: 403 })
    }
    const { id } = params
    const body = await request.json()
    const { resolution } = body
    if (!resolution) {
      return NextResponse.json(createError('Resolução obrigatória', 400), { status: 400 })
    }
    const dispute = await prisma.dispute.update({ where: { id }, data: { status: 'RESOLVED', resolution, resolvedBy: session.user.id, resolvedAt: new Date() } })
    return NextResponse.json(successResponse(dispute, 'Disputa resolvida'), { status: 200 })
  } catch (error) {
    return NextResponse.json(createError('Erro ao resolver disputa', 500), { status: 500 })
  }
} 