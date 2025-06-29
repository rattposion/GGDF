import { Gerencianet } from 'gerencianet'

// Configuração da Gerencianet
const gerencianet = new Gerencianet({
  client_id: process.env.GERENCIANET_CLIENT_ID!,
  client_secret: process.env.GERENCIANET_CLIENT_SECRET!,
  sandbox: process.env.GERENCIANET_SANDBOX === 'true',
})

// Interface para dados do Pix
interface PixData {
  orderId: string
  amount: number
  buyerName: string
  buyerEmail: string
  buyerDocument?: string
}

// Interface para resposta do Pix
interface PixResponse {
  qrCode: string
  qrCodeText: string
  expiresAt: Date
  paymentId: string
}

// Criar cobrança Pix
export async function createPixPayment(data: PixData): Promise<PixResponse> {
  try {
    const pixData = {
      calendario: {
        expiracao: 1800, // 30 minutos
      },
      devedor: {
        nome: data.buyerName,
        email: data.buyerEmail,
        ...(data.buyerDocument && { cpf: data.buyerDocument }),
      },
      valor: {
        original: data.amount.toFixed(2),
      },
      chave: process.env.GERENCIANET_PIX_KEY!,
      solicitacaoPagador: `Pedido ${data.orderId}`,
    }

    // Criar cobrança imediata
    const response = await gerencianet.pixCreateImmediateCharge([], pixData)
    
    // Gerar QR Code
    const qrCode = await gerencianet.pixGenerateQRCode({ id: response.loc.id })
    
    // Calcular data de expiração
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    
    return {
      qrCode: qrCode.qrcode,
      qrCodeText: qrCode.qrcode,
      expiresAt,
      paymentId: response.loc.id,
    }
  } catch (error) {
    console.error('Erro ao criar cobrança Pix:', error)
    throw new Error('Falha ao criar cobrança Pix')
  }
}

// Consultar status de uma cobrança
export async function getPixStatus(paymentId: string) {
  try {
    const response = await gerencianet.pixDetailCharge({ txid: paymentId })
    return response
  } catch (error) {
    console.error('Erro ao consultar status Pix:', error)
    throw new Error('Falha ao consultar status Pix')
  }
}

// Listar cobranças
export async function listPixCharges(params: any = {}) {
  try {
    const response = await gerencianet.pixListCharges(params)
    return response
  } catch (error) {
    console.error('Erro ao listar cobranças Pix:', error)
    throw new Error('Falha ao listar cobranças Pix')
  }
}

// Devolver Pix (estorno)
export async function refundPix(paymentId: string, amount: number, reason: string) {
  try {
    const refundData = {
      valor: amount.toFixed(2),
      motivo: reason,
    }
    
    const response = await gerencianet.pixDevolution({ txid: paymentId }, refundData)
    return response
  } catch (error) {
    console.error('Erro ao devolver Pix:', error)
    throw new Error('Falha ao processar devolução Pix')
  }
}

// Verificar assinatura do webhook
export function verifyWebhookSignature(body: string, signature: string): boolean {
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.GERENCIANET_CLIENT_SECRET!)
      .update(body)
      .digest('hex')
    
    return signature === `sha256=${expectedSignature}`
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error)
    return false
  }
}

// Processar notificação do webhook
export function processWebhookNotification(data: any) {
  try {
    const event = data.evento
    const pix = data.pix?.[0]
    
    if (!pix) {
      throw new Error('Dados Pix não encontrados na notificação')
    }
    
    return {
      event,
      paymentId: pix.txid,
      amount: parseFloat(pix.valor),
      status: pix.status,
      paidAt: pix.horario ? new Date(pix.horario) : null,
      payer: {
        name: pix.pagador?.nome,
        document: pix.pagador?.cpf,
        email: pix.pagador?.email,
      }
    }
  } catch (error) {
    console.error('Erro ao processar notificação:', error)
    throw new Error('Falha ao processar notificação do webhook')
  }
}

export default gerencianet 