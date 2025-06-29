import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { userSchema, hashPassword, createError, successResponse, logActivity } from '../../../../lib/utils'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = userSchema.parse(body)
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        createError('Email já cadastrado', 400),
        { status: 400 }
      )
    }
    
    // Verificar se username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username }
    })
    
    if (existingUsername) {
      return NextResponse.json(
        createError('Nome de usuário já existe', 400),
        { status: 400 }
      )
    }
    
    // Hash da senha
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Gerar token de verificação
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        steamId: validatedData.steamId,
        emailVerificationToken: verificationToken,
        role: 'COMPRADOR',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true,
      }
    })
    
    // Log da atividade
    await logActivity(user.id, 'USER_REGISTER', 'user', { email: user.email })
    
    // TODO: Enviar email de verificação
    // await sendVerificationEmail(user.email, verificationToken)
    
    return NextResponse.json(
      successResponse(user, 'Usuário criado com sucesso. Verifique seu email para ativar a conta.'),
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createError('Dados inválidos', 400),
        { status: 400 }
      )
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      createError('Erro interno do servidor', 500),
      { status: 500 }
    )
  }
} 