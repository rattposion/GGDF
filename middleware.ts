import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/',
    '/auth',
    '/api/auth',
    '/api/products',
    '/api/categories',
    '/api/steam/inventory',
  ]

  // Rotas que precisam de autenticação
  const protectedRoutes = [
    '/api/user',
    '/api/products/me',
    '/api/orders',
    '/api/checkout',
    '/api/chat',
    '/api/wallet',
    '/api/notifications',
  ]

  // Rotas que precisam de role admin
  const adminRoutes = [
    '/api/admin',
    '/admin',
  ]

  // Rotas que precisam de role vendedor
  const sellerRoutes = [
    '/api/products/create',
    '/api/products/update',
    '/api/products/delete',
  ]

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isSellerRoute = sellerRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Se não for rota pública, verificar autenticação
  if (!isPublicRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar permissões para rotas admin
    if (isAdminRoute && token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Verificar permissões para rotas de vendedor
    if (isSellerRoute && token.role !== 'VENDEDOR' && token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Seller access required' },
        { status: 403 }
      )
    }
  }

  // Rate limiting básico
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitKey = `rate_limit:${ip}`
  
  // Aqui você implementaria a lógica de rate limiting com Redis
  // Por enquanto, apenas um exemplo básico
  const requestCount = parseInt(request.headers.get('x-request-count') || '0')
  
  if (requestCount > 100) { // 100 requests por IP
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Adicionar headers de segurança
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 