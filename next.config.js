/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputStandalone: true,
  },
  output: 'standalone',
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  // Desabilitar renderização estática para rotas que usam recursos dinâmicos
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  // Configurar para não tentar renderizar rotas de API estaticamente
  async rewrites() {
    return []
  },
}

module.exports = nextConfig 