import prisma from '../src/prisma';

async function main() {
  // Busca as 5 categorias mais populares (com mais produtos)
  const categories = await prisma.category.findMany({
    include: { subcategories: true, products: true },
  });
  const sorted = categories.sort((a, b) => (b.products?.length || 0) - (a.products?.length || 0)).slice(0, 5);

  // Busca um usuário vendedor qualquer
  const seller = await prisma.user.findFirst();
  if (!seller) throw new Error('Nenhum usuário encontrado. Crie um usuário primeiro.');

  for (const cat of sorted) {
    const subcat = cat.subcategories[0];
    if (!subcat) continue;
    for (let i = 1; i <= 3; i++) {
      await prisma.product.create({
        data: {
          title: `Produto ${i} de ${cat.name}`,
          description: `Descrição do produto ${i} na categoria ${cat.name}`,
          price: 10 * i,
          images: ['https://via.placeholder.com/300'],
          categoryId: cat.id,
          subcategoryId: subcat.id,
          type: cat.name.toLowerCase().replace(/ /g, '-'),
          sellerId: seller.id,
          stock: 10 * i,
          guarantee: '7 dias',
        }
      });
    }
  }
  console.log('Produtos de exemplo criados!');
}

main().catch(e => { console.error(e); process.exit(1); }); 