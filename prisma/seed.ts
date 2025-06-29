import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ggdf.com' },
    update: {},
    create: {
      email: 'admin@ggdf.com',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      verified: true,
      emailVerified: true,
      reputation: 100,
    },
  })

  console.log('✅ Usuário admin criado:', admin.username)

  // Criar categorias
  const categories = [
    {
      name: 'Skins',
      slug: 'skins',
      icon: '🎮',
      description: 'Skins para jogos como CS2, Dota 2, TF2, Rust',
      featured: true,
      subcategories: [
        { name: 'CS2', slug: 'cs2', icon: '🔫' },
        { name: 'Dota 2', slug: 'dota2', icon: '⚔️' },
        { name: 'TF2', slug: 'tf2', icon: '🛠️' },
        { name: 'Rust', slug: 'rust', icon: '🦀' },
      ]
    },
    {
      name: 'Contas',
      slug: 'contas',
      icon: '👤',
      description: 'Contas de jogos e serviços',
      featured: true,
      subcategories: [
        { name: 'Steam', slug: 'steam', icon: '🎮' },
        { name: 'Netflix', slug: 'netflix', icon: '📺' },
        { name: 'Spotify', slug: 'spotify', icon: '🎵' },
        { name: 'Disney+', slug: 'disney', icon: '🏰' },
        { name: 'HBO Max', slug: 'hbo', icon: '📺' },
        { name: 'Crunchyroll', slug: 'crunchyroll', icon: '🍜' },
      ]
    },
    {
      name: 'Keys',
      slug: 'keys',
      icon: '🔑',
      description: 'Chaves de ativação para jogos e software',
      featured: false,
      subcategories: [
        { name: 'Jogos', slug: 'jogos', icon: '🎮' },
        { name: 'Software', slug: 'software', icon: '💻' },
        { name: 'DLCs', slug: 'dlcs', icon: '📦' },
      ]
    },
    {
      name: 'Serviços',
      slug: 'servicos',
      icon: '⚙️',
      description: 'Serviços de boost, coaching e outros',
      featured: false,
      subcategories: [
        { name: 'Boost', slug: 'boost', icon: '🚀' },
        { name: 'Coaching', slug: 'coaching', icon: '👨‍🏫' },
        { name: 'Recuperação', slug: 'recuperacao', icon: '🔒' },
        { name: 'Customização', slug: 'customizacao', icon: '🎨' },
      ]
    },
    {
      name: 'Assinaturas',
      slug: 'assinaturas',
      icon: '📅',
      description: 'Assinaturas mensais e vitalícias',
      featured: false,
      subcategories: [
        { name: 'Mensal', slug: 'mensal', icon: '📅' },
        { name: 'Vitalícia', slug: 'vitalicia', icon: '♾️' },
        { name: 'Anual', slug: 'anual', icon: '📆' },
      ]
    },
  ]

  for (const categoryData of categories) {
    const { subcategories, ...categoryInfo } = categoryData
    
    const category = await prisma.category.upsert({
      where: { slug: categoryInfo.slug },
      update: {},
      create: categoryInfo,
    })

    console.log(`✅ Categoria criada: ${category.name}`)

    // Criar subcategorias
    for (const subcategoryData of subcategories) {
      await prisma.subcategory.upsert({
        where: { slug: subcategoryData.slug },
        update: {},
        create: {
          ...subcategoryData,
          categoryId: category.id,
        },
      })
    }

    console.log(`✅ ${subcategories.length} subcategorias criadas para ${category.name}`)
  }

  // Criar alguns produtos de exemplo
  const sampleProducts = [
    {
      title: 'AK-47 | Redline (Field-Tested)',
      description: 'AK-47 Redline em excelente estado. Float 0.18, muito bem conservada. Ideal para jogadores que buscam uma skin de qualidade.',
      price: 45.90,
      type: 'SKIN' as const,
      categorySlug: 'skins',
      subcategorySlug: 'cs2',
      guarantee: '7 dias',
      autoDelivery: true,
      deliveryType: 'STEAM_TRADE' as const,
      stock: 1,
      featured: true,
      steamCustody: true,
      images: [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      ]
    },
    {
      title: 'Conta Netflix Premium 4K',
      description: 'Conta Netflix Premium com 4K, 4 telas simultâneas. Conta verificada e funcionando perfeitamente. Suporte 24/7.',
      price: 12.90,
      type: 'CONTA' as const,
      categorySlug: 'contas',
      subcategorySlug: 'netflix',
      guarantee: '30 dias',
      autoDelivery: true,
      deliveryType: 'TEXT' as const,
      stock: 10,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
      ]
    },
    {
      title: 'Steam Gift Card R$ 50',
      description: 'Cartão presente Steam no valor de R$ 50. Ativação instantânea via email. Perfeito para comprar jogos, DLCs ou skins.',
      price: 50.00,
      type: 'KEY' as const,
      categorySlug: 'keys',
      subcategorySlug: 'jogos',
      guarantee: '7 dias',
      autoDelivery: true,
      deliveryType: 'TEXT' as const,
      stock: 25,
      featured: false,
      images: [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      ]
    },
  ]

  for (const productData of sampleProducts) {
    const { categorySlug, subcategorySlug, images, ...productInfo } = productData
    
    // Buscar categoria e subcategoria
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    })
    
    const subcategory = await prisma.subcategory.findUnique({
      where: { slug: subcategorySlug }
    })
    
    if (!category) {
      console.log(`❌ Categoria não encontrada: ${categorySlug}`)
      continue
    }
    
    // Criar produto
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        userId: admin.id,
        categoryId: category.id,
        subcategoryId: subcategory?.id || null,
        status: 'ACTIVE',
        views: Math.floor(Math.random() * 1000),
        favorites: Math.floor(Math.random() * 100),
        rating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 50),
      }
    })
    
    // Criar imagens do produto
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: images[i],
          alt: `${product.title} - Imagem ${i + 1}`,
          order: i,
        }
      })
    }
    
    console.log(`✅ Produto criado: ${product.title}`)
  }

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 