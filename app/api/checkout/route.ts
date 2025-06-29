import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createError, successResponse, logActivity } from '../../../lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

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
    const { productId, variationId, subscriptionPlanId, quantity = 1 } = body
    
    // Validar dados
    if (!productId) {
      return NextResponse.json(
        createError('ID do produto é obrigatório', 400),
        { status: 400 }
      )
    }
    
    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          }
        },
        variations: true,
        subscriptionPlans: true,
      }
    })
    
    if (!product) {
      return NextResponse.json(
        createError('Produto não encontrado', 404),
        { status: 404 }
      )
    }
    
    if (product.status !== 'ACTIVE') {
      return NextResponse.json(
        createError('Produto não está disponível para compra', 400),
        { status: 400 }
      )
    }
    
    // Verificar estoque
    if (product.stock !== null && product.stock < quantity) {
      return NextResponse.json(
        createError('Estoque insuficiente', 400),
        { status: 400 }
      )
    }
    
    // Calcular preço
    let finalPrice = product.price
    let selectedVariation = null
    let selectedPlan = null
    
    if (variationId) {
      selectedVariation = product.variations.find(v => v.id === variationId)
      if (!selectedVariation) {
        return NextResponse.json(
          createError('Variação não encontrada', 400),
          { status: 400 }
        )
      }
      finalPrice = selectedVariation.price
      
      if (selectedVariation.stock !== null && selectedVariation.stock < quantity) {
        return NextResponse.json(
          createError('Estoque insuficiente para esta variação', 400),
          { status: 400 }
        )
      }
    }
    
    if (subscriptionPlanId) {
      selectedPlan = product.subscriptionPlans.find(p => p.id === subscriptionPlanId)
      if (!selectedPlan) {
        return NextResponse.json(
          createError('Plano de assinatura não encontrado', 400),
          { status: 400 }
        )
      }
      finalPrice = selectedPlan.price
    }
    
    const totalAmount = finalPrice * quantity
    
    // Verificar se não está comprando de si mesmo
    if (product.userId === session.user.id) {
      return NextResponse.json(
        createError('Você não pode comprar seu próprio produto', 400),
        { status: 400 }
      )
    }
    
    // Criar pedido
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        sellerId: product.userId,
        productId: product.id,
        variationId: selectedVariation?.id || null,
        subscriptionPlanId: selectedPlan?.id || null,
        amount: totalAmount,
        status: 'PENDING',
        paymentMethod: 'pix',
      },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            images: {
              take: 1,
              orderBy: { order: 'asc' },
            }
          }
        }
      }
    })
    
    // TODO: Integração com Gerencianet PIX
    // const pixPayment = await createPixPayment({
    //   orderId: order.id,
    //   amount: totalAmount,
    //   buyerName: order.buyer.username,
    //   buyerEmail: order.buyer.email,
    // })
    
    // Simular resposta do PIX (remover em produção)
    const pixPayment = {
      qrCode: '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Teste Empresa6008Brasilia62070503***6304E2CA',
      qrCodeText: 'pix.example.com/pay/123456',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      paymentId: `pix_${order.id}`,
    }
    
    // Atualizar pedido com ID do pagamento
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: pixPayment.paymentId }
    })
    
    // Log da atividade
    await logActivity(session.user.id, 'ORDER_CREATED', 'order', { 
      orderId: order.id, 
      productId: product.id,
      amount: totalAmount 
    })
    
    // TODO: Enviar notificação para o vendedor
    // await createNotification(
    //   product.userId,
    //   'Nova venda!',
    //   `Você recebeu um novo pedido de ${order.buyer.username}`,
    //   'SALE',
    //   `/orders/${order.id}`
    // )
    
    return NextResponse.json(
      successResponse({
        order: {
          id: order.id,
          amount: order.amount,
          status: order.status,
          createdAt: order.createdAt,
          product: {
            id: order.product.id,
            title: order.product.title,
            image: order.product.images[0]?.url,
          },
          seller: {
            id: order.seller.id,
            username: order.seller.username,
          }
        },
        payment: {
          qrCode: pixPayment.qrCode,
          qrCodeText: pixPayment.qrCodeText,
          expiresAt: pixPayment.expiresAt,
          paymentId: pixPayment.paymentId,
        }
      }, 'Pedido criado com sucesso'),
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      createError('Erro ao processar checkout', 500),
      { status: 500 }
    )
  }
}

// Função para criar pagamento PIX (implementar com Gerencianet)
async function createPixPayment(data: {
  orderId: string
  amount: number
  buyerName: string
  buyerEmail: string
}) {
  // TODO: Implementar integração real com Gerencianet
  // const gerencianet = new Gerencianet({
  //   client_id: process.env.GERENCIANET_CLIENT_ID,
  //   client_secret: process.env.GERENCIANET_CLIENT_SECRET,
  //   sandbox: process.env.GERENCIANET_SANDBOX === 'true',
  // })
  
  // const pixData = {
  //   calendario: {
  //     expiracao: 1800, // 30 minutos
  //   },
  //   devedor: {
  //     nome: data.buyerName,
  //     email: data.buyerEmail,
  //   },
  //   valor: {
  //     original: data.amount.toFixed(2),
  //   },
  //   chave: process.env.GERENCIANET_PIX_KEY,
  //   solicitacaoPagador: `Pedido ${data.orderId}`,
  // }
  
  // const response = await gerencianet.pixCreateImmediateCharge([], pixData)
  // const qrCode = await gerencianet.pixGenerateQRCode({ id: response.loc.id })
  
  // return {
  //   qrCode: qrCode.qrcode,
  //   qrCodeText: qrCode.qrcode,
  //   expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  //   paymentId: response.loc.id,
  // }
  
  // Simulação para desenvolvimento
  return {
    qrCode: '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Teste Empresa6008Brasilia62070503***6304E2CA',
    qrCodeText: 'pix.example.com/pay/123456',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    paymentId: `pix_${data.orderId}`,
  }
} 