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
}

module.exports = nextConfig 