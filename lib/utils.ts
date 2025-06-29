import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import sanitizeHtml from 'sanitize-html'

// Schemas de validação
export const userSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  steamId: z.string().optional(),
})

export const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  type: z.enum(['SKIN', 'CONTA', 'KEY', 'JOGO', 'SERVICO', 'ASSINATURA']),
  categoryId: z.string(),
  subcategoryId: z.string().optional(),
  guarantee: z.string(),
  autoDelivery: z.boolean(),
  deliveryType: z.enum(['TEXT', 'LINK', 'FILE', 'STEAM_TRADE']),
  stock: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  validity: z.date().optional(),
})

export const orderSchema = z.object({
  productId: z.string(),
  variationId: z.string().optional(),
  subscriptionPlanId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
})

// Funções de hash e verificação
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// Funções JWT
export const generateToken = (payload: any, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn })
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    return null
  }
}

// Funções de sanitização
export const sanitizeText = (text: string): string => {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  })
}

export const sanitizeHtml = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
    allowedAttributes: {
      'a': ['href']
    },
  })
}

// Funções de validação
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidSteamId = (steamId: string): boolean => {
  const steamIdRegex = /^[0-9]{17}$/
  return steamIdRegex.test(steamId)
}

// Funções de geração
export const generateId = (): string => {
  return uuidv4()
}

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Funções de formatação
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Funções de paginação
export const paginateResults = <T>(
  results: T[],
  page: number = 1,
  limit: number = 10
) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedResults = results.slice(startIndex, endIndex)

  return {
    data: paginatedResults,
    pagination: {
      page,
      limit,
      total: results.length,
      totalPages: Math.ceil(results.length / limit),
      hasNext: endIndex < results.length,
      hasPrev: page > 1,
    },
  }
}

// Funções de erro
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  return new AppError(message, statusCode)
}

// Funções de resposta
export const successResponse = (data: any, message: string = 'Success') => {
  return {
    success: true,
    message,
    data,
  }
}

export const errorResponse = (message: string, statusCode: number = 500) => {
  return {
    success: false,
    message,
    statusCode,
  }
}

// Funções de validação de arquivo
export const validateFile = (file: Express.Multer.File) => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ]

  if (file.size > maxSize) {
    throw new AppError('Arquivo muito grande', 400)
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError('Tipo de arquivo não permitido', 400)
  }

  return true
}

// Funções de Steam
export const convertSteamId = (steamId: string): string => {
  // Converte Steam ID para Steam64 ID
  const steamIdRegex = /^STEAM_[0-9]:[0-9]:[0-9]+$/
  if (steamIdRegex.test(steamId)) {
    const parts = steamId.split(':')
    const accountId = parseInt(parts[2]) * 2 + parseInt(parts[1])
    return (BigInt(accountId) + BigInt('76561197960265728')).toString()
  }
  return steamId
}

// Funções de cache
export const generateCacheKey = (...parts: string[]): string => {
  return parts.join(':')
}

// Funções de notificação
export const createNotification = async (
  userId: string,
  title: string,
  content: string,
  type: string,
  link?: string
) => {
  // Implementar criação de notificação
  console.log('Notification created:', { userId, title, content, type, link })
}

// Funções de log
export const logActivity = async (
  userId: string | null,
  action: string,
  target?: string,
  metadata?: any
) => {
  // Implementar log de atividade
  console.log('Activity logged:', { userId, action, target, metadata })
} 