import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

// Extender os tipos do NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      role: string
      avatar?: string
    }
  }
  
  interface User {
    id: string
    email: string
    username: string
    role: string
    avatar?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    username: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
      }
      
      // Processar login Steam se necessário
      if (account?.provider === 'steam') {
        try {
          // Buscar ou criar usuário Steam
          const steamUser = await prisma.user.upsert({
            where: { steamId: token.sub! },
            update: {
              lastLogin: new Date(),
            },
            create: {
              steamId: token.sub!,
              username: token.name!,
              email: token.email!,
              avatar: token.picture,
              verified: true,
              role: 'COMPRADOR',
            },
          })
          
          token.id = steamUser.id
          token.role = steamUser.role
          token.username = steamUser.username
        } catch (error) {
          console.error('Erro ao processar login Steam:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.username = token.username
      }
      return session
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
} 