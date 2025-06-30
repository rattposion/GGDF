/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Railway
  output: 'standalone',
  
  // Configurações de imagem
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'ggdf-production.up.railway.app'],
    unoptimized: true,
  },
  
  // Configurações de ambiente
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // Headers para APIs
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
  
  // Configurações de build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Configurações de servidor
  serverRuntimeConfig: {
    // Configurações que só existem no servidor
  },
  
  publicRuntimeConfig: {
    // Configurações que existem no cliente e servidor
  },
}

module.exports = nextConfig 