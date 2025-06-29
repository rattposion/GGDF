import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { createError, successResponse } from '../../../../lib/utils'
import { getSteamInventory } from '../../../../lib/steam'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const steamId = searchParams.get('steamId')
    
    if (!steamId) {
      return NextResponse.json(createError('Steam ID é obrigatório', 400), { status: 400 })
    }
    
    // Buscar itens Steam do usuário
    const items = await prisma.steamItem.findMany({
      where: { 
        userId: steamId,
        inCustody: false, // Apenas itens não em custódia
        tradable: true,   // Apenas itens negociáveis
      },
      orderBy: { estimatedPrice: 'desc' }
    })
    
    return NextResponse.json(successResponse(items), { status: 200 })
    
  } catch (error) {
    console.error('Steam inventory error:', error)
    return NextResponse.json(createError('Erro ao buscar inventário Steam', 500), { status: 500 })
  }
} 