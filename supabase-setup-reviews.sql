-- =============================================
-- Tabela de avaliações (reviews)
-- Cole este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL DEFAULT '',
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index para buscar reviews por produto
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- 3. Impedir review duplicada do mesmo cliente no mesmo produto
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_per_customer ON reviews(product_id, customer_id);

-- 4. RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler reviews
CREATE POLICY "Reviews são públicos" ON reviews
  FOR SELECT USING (true);

-- Só usuários logados podem criar review
CREATE POLICY "Usuários logados podem criar review" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Usuário só pode deletar a própria review
CREATE POLICY "Usuário pode deletar própria review" ON reviews
  FOR DELETE USING (auth.uid() = customer_id);
