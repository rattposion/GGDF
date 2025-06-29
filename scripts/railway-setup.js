const { execSync } = require('child_process');

console.log('🚀 Configurando aplicação no Railway...');

try {
  // Gerar cliente Prisma
  console.log('🔧 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Verificar se DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada!');
    process.exit(1);
  }
  
  // Sincronizar banco de dados
  console.log('🗄️ Sincronizando banco de dados...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Executar seed se existir
  console.log('🌱 Executando seed...');
  try {
    execSync('npm run db:seed', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Seed não executado (pode não existir)');
  }
  
  console.log('✅ Aplicação configurada com sucesso no Railway!');
  
} catch (error) {
  console.error('❌ Erro ao configurar aplicação:', error.message);
  process.exit(1);
} 