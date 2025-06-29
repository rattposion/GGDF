import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createError, successResponse, logActivity } from '../../../../../lib/utils'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    
    // Verificar assinatura do webhook (segurança)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.GERENCIANET_CLIENT_SECRET!)
      .update(body)
      .digest('hex')
    
    if (signature !== `sha256=${expectedSignature}`) {
      console.error('Webhook signature inválida')
      return NextResponse.json(createError('Assinatura inválida', 401), { status: 401 })
    }
    
    const data = JSON.parse(body)
    console.log('Webhook recebido:', data)
    
    // Processar diferentes tipos de notificação
    if (data.evento === 'pix.pago') {
      const pix = data.pix[0]
      const paymentId = pix.txid
      
      // Buscar pedido pelo ID do pagamento
      const order = await prisma.order.findFirst({
        where: { paymentId },
        include: {
          buyer: { select: { id: true, username: true, email: true } },
          seller: { select: { id: true, username: true, email: true } },
          product: { select: { id: true, title: true, autoDelivery: true, deliveryType: true } }
        }
      })
      
      if (!order) {
        console.error('Pedido não encontrado para paymentId:', paymentId)
        return NextResponse.json(createError('Pedido não encontrado', 404), { status: 404 })
      }
      
      // Atualizar status do pedido para PAID
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: 'PAID',
          updatedAt: new Date()
        }
      })
      
      // Criar transação na carteira do vendedor
      await prisma.walletTransaction.create({
        data: {
          userId: order.seller.id,
          type: 'SALE',
          amount: order.amount,
          description: `Venda: ${order.product.title}`,
          status: 'COMPLETED',
          reference: order.id
        }
      })
      
      // Se for entrega automática, processar entrega
      if (order.product.autoDelivery) {
        await processAutoDelivery(order)
      }
      
      // Log da atividade
      await logActivity(order.buyer.id, 'PAYMENT_CONFIRMED', 'order', { 
        orderId: order.id, 
        paymentId,
        amount: order.amount 
      })
      
      // TODO: Enviar notificações
      // await createNotification(order.buyer.id, 'Pagamento confirmado!', 'Seu pedido foi pago e está sendo processado.', 'PAYMENT')
      // await createNotification(order.seller.id, 'Venda realizada!', `Pedido ${order.id} foi pago.`, 'SALE')
      
      console.log(`Pedido ${order.id} marcado como pago`)
    }
    
    return NextResponse.json(successResponse(null, 'Webhook processado'), { status: 200 })
    
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(createError('Erro interno', 500), { status: 500 })
  }
}

// Função para processar entrega automática
async function processAutoDelivery(order: any) {
  try {
    const deliveryType = order.product.deliveryType
    
    let content = ''
    let fileUrl = null
    
    switch (deliveryType) {
      case 'TEXT':
        content = 'Entrega automática: Seu produto foi entregue automaticamente após confirmação do pagamento.'
        break
      case 'LINK':
        content = 'https://example.com/download/' + order.id
        break
      case 'FILE':
        fileUrl = 'https://example.com/files/' + order.id + '.zip'
        break
      case 'STEAM_TRADE':
        // TODO: Implementar trade automático via Steam Bot
        content = 'Trade Steam será processado automaticamente.'
        break
    }
    
    // Criar entrega
    await prisma.delivery.create({
      data: {
        orderId: order.id,
        type: deliveryType,
        content,
        fileUrl,
        status: 'DELIVERED',
        deliveredAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      }
    })
    
    // Atualizar status do pedido
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'DELIVERED',
        deliveredAt: new Date()
      }
    })
    
    console.log(`Entrega automática processada para pedido ${order.id}`)
    
  } catch (error) {
    console.error('Erro na entrega automática:', error)
  }
} 