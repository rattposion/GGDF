import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { createError, successResponse } from '../../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(createError('Usuário não autenticado', 401), { status: 401 })
    }
    
    const body = await request.json()
    const { assetId, classId, instanceId, name, marketName, type, rarity, quality, game, iconUrl, imageUrl, float, wear, estimatedPrice } = body
    
    // Validar dados obrigatórios
    if (!assetId || !classId || !name || !estimatedPrice) {
      return NextResponse.json(createError('Dados obrigatórios faltando', 400), { status: 400 })
    }
    
    // TODO: Verificar se o item realmente pertence ao usuário via Steam API
    // TODO: Criar trade offer para transferir item para o bot
    
    // Criar registro do item em custódia
    const steamItem = await prisma.steamItem.create({
      data: {
        userId: session.user.id,
        assetId,
        classId,
        instanceId,
        name,
        marketName,
        type,
        rarity,
        quality,
        game,
        iconUrl,
        imageUrl,
        float,
        wear,
        estimatedPrice,
        inCustody: true,
        listedForSale: false,
      }
    })
    
    return NextResponse.json(successResponse(steamItem, 'Item depositado em custódia'), { status: 201 })
    
  } catch (error) {
    console.error('Steam deposit error:', error)
    return NextResponse.json(createError('Erro ao depositar item', 500), { status: 500 })
  }
} 