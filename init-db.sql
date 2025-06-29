-- ========================================
-- Script de inicialização do banco GGDF
-- ========================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_steam_id ON users(steam_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);

-- Criar índices de texto para busca
CREATE INDEX IF NOT EXISTS idx_products_title_gin ON products USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON products USING gin(to_tsvector('portuguese', description));

-- Configurar permissões
GRANT ALL PRIVILEGES ON DATABASE ggdf_db TO ggdf_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ggdf_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ggdf_user;

-- Configurar para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ggdf_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ggdf_user; 