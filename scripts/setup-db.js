const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando banco de dados...');

// Verificar se o arquivo .env existe
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env...');
  const envExamplePath = path.join(__dirname, '..', 'env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Arquivo .env criado com sucesso!');
  } else {
    console.error('❌ Arquivo env.example não encontrado!');
    process.exit(1);
  }
}

try {
  // Gerar cliente Prisma
  console.log('🔧 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Criar banco de dados (se não existir)
  console.log('🗄️ Criando banco de dados...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Executar seed (se existir)
  console.log('🌱 Executando seed...');
  try {
    execSync('npm run db:seed', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Seed não executado (pode não existir)');
  }
  
  console.log('✅ Banco de dados configurado com sucesso!');
  console.log('');
  console.log('📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente no arquivo .env');
  console.log('2. Execute: npm run dev');
  console.log('3. Acesse: http://localhost:3000');
  
} catch (error) {
  console.error('❌ Erro ao configurar banco de dados:', error.message);
  console.log('');
  console.log('💡 Dicas:');
  console.log('- Certifique-se de que o PostgreSQL está instalado e rodando');
  console.log('- Verifique se a URL do banco no .env está correta');
  console.log('- Execute: createdb ggdf_db (se o banco não existir)');
  process.exit(1);
} 