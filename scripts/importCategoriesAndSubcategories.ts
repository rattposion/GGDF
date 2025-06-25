import prisma from '../src/prisma';

const categorias = [
  {
    name: 'Contas de Jogos',
    slug: 'contas-de-jogos',
    icon: '🎮',
    description: 'Contas de jogos digitais',
    subcategorias: [
      { name: 'Valorant', emoji: '🦊' },
      { name: 'League of Legends (LOL)', emoji: '🧙‍♂️' },
      { name: 'Fortnite', emoji: '🏗️' },
      { name: 'Free Fire', emoji: '🔥' },
      { name: 'Roblox (ex: Blox Fruits)', emoji: '🧱' },
      { name: 'Clash of Clans', emoji: '🏰' },
      { name: 'Clash Royale', emoji: '👑' },
      { name: 'Call of Duty', emoji: '🔫' },
      { name: 'Steam (contas com jogos)', emoji: '💻' }
    ]
  },
  {
    name: 'Skins e Itens Virtuais',
    slug: 'skins-e-itens-virtuais',
    icon: '🖼️',
    description: 'Skins e itens virtuais para jogos',
    subcategorias: [
      { name: 'CS:GO (skins, facas, etc.)', emoji: '🔪' },
      { name: 'Dota 2', emoji: '⚔️' },
      { name: 'Rust', emoji: '🪓' },
      { name: 'Team Fortress 2', emoji: '🛠️' },
      { name: 'PUBG', emoji: '🏞️' },
      { name: 'Rocket League', emoji: '🚗' }
    ]
  },
  {
    name: 'Moedas e Créditos',
    slug: 'moedas-e-creditos',
    icon: '🪙',
    description: 'Moedas e créditos virtuais',
    subcategorias: [
      { name: 'Robux', emoji: '💵' },
      { name: 'V-Bucks', emoji: '💸' },
      { name: 'UC (PUBG Mobile)', emoji: '🪙' },
      { name: 'Gold (WoW, GTA RP, etc.)', emoji: '🥇' },
      { name: 'CashPoint, Diamantes', emoji: '💎' }
    ]
  },
  {
    name: 'Gift Cards e Keys',
    slug: 'gift-cards-e-keys',
    icon: '📦',
    description: 'Gift cards e keys de jogos',
    subcategorias: [
      { name: 'Steam Gift Card', emoji: '🎫' },
      { name: 'Google Play', emoji: '▶️' },
      { name: 'Xbox Live', emoji: '🟩' },
      { name: 'Playstation Network', emoji: '🎮' },
      { name: 'Cartões iFood, Uber', emoji: '🍔' },
      { name: 'Keys de jogos (GTA V, Minecraft, etc.)', emoji: '🔑' }
    ]
  },
  {
    name: 'Serviços Digitais',
    slug: 'servicos-digitais',
    icon: '🔧',
    description: 'Serviços digitais diversos',
    subcategorias: [
      { name: 'Boosting (Valorant, LOL, CS)', emoji: '🚀' },
      { name: 'Coaching', emoji: '🎓' },
      { name: 'Edição de vídeo/design', emoji: '🎬' },
      { name: 'Criação de thumbnail/banner', emoji: '🖌️' },
      { name: 'Criação de sites', emoji: '🌐' },
      { name: 'Scripts e bots', emoji: '🤖' },
      { name: 'Serviços de bots para Discord', emoji: '💬' }
    ]
  },
  {
    name: 'Assinaturas e Licenças',
    slug: 'assinaturas-e-licencas',
    icon: '📺',
    description: 'Assinaturas e licenças digitais',
    subcategorias: [
      { name: 'Netflix, Amazon Prime, Spotify', emoji: '📺' },
      { name: 'NordVPN, Surfshark', emoji: '🦈' },
      { name: 'IPTV', emoji: '📡' },
      { name: 'Canva Pro, Photoshop', emoji: '🎨' },
      { name: 'Office 365, Windows 10/11', emoji: '🪟' }
    ]
  },
  {
    name: 'Outros',
    slug: 'outros',
    icon: '🧩',
    description: 'Outros produtos digitais',
    subcategorias: [
      { name: 'Cursos online', emoji: '💻' },
      { name: 'Templates', emoji: '📄' },
      { name: 'Packs de design', emoji: '📦' },
      { name: 'Plugins premium', emoji: '🔌' },
      { name: 'Contas Premium (ChatGPT, MidJourney, etc.)', emoji: '🤩' }
    ]
  }
];

async function main() {
  for (const cat of categorias) {
    // Cria ou atualiza categoria
    let categoria = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description }
    });
    for (const sub of cat.subcategorias) {
      const subSlug = sub.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '');
      // Busca subcategoria existente
      const existing = await prisma.subcategory.findFirst({ where: { name: sub.name, categoryId: categoria.id } });
      if (existing) {
        await prisma.subcategory.update({ where: { id: existing.id }, data: { emoji: sub.emoji, slug: subSlug } });
      } else {
        await prisma.subcategory.create({ data: { name: sub.name, slug: subSlug, categoryId: categoria.id, emoji: sub.emoji } });
      }
    }
  }
  console.log('Categorias e subcategorias importadas com sucesso!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); }); 