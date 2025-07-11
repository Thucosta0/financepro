-- ===========================================
-- ÍNDICES COMPOSTOS PARA MELHOR PERFORMANCE
-- Execute no SQL Editor do Supabase
-- ===========================================

-- 1. Índice composto para filtros comuns em transações (user + data + tipo)
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_type 
ON public.transactions(user_id, transaction_date DESC, type);

-- 2. Índice composto para filtros por categoria e data
CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date 
ON public.transactions(user_id, category_id, transaction_date DESC);

-- 3. Índice composto para filtros por cartão e data
CREATE INDEX IF NOT EXISTS idx_transactions_user_card_date 
ON public.transactions(user_id, card_id, transaction_date DESC);

-- 4. Índice para ordenação por data com status de conclusão
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_completed 
ON public.transactions(user_id, transaction_date DESC, is_completed);

-- 5. Índice para busca por valor (range queries)
CREATE INDEX IF NOT EXISTS idx_transactions_user_amount 
ON public.transactions(user_id, amount);

-- 6. Índice para transações recorrentes ativas com próxima execução
CREATE INDEX IF NOT EXISTS idx_recurring_user_active_next 
ON public.recurring_transactions(user_id, is_active, next_execution_date);

-- 7. Índice para orçamentos por período específico
CREATE INDEX IF NOT EXISTS idx_budgets_user_period_category 
ON public.budgets(user_id, year, month, category_id);

-- 8. Índice para login por username (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower 
ON public.profiles(LOWER(username));

-- 9. Índice para profiles ativos (email confirmado)
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed 
ON public.profiles(email) WHERE email IS NOT NULL;

-- 10. Índice para busca de transações por descrição (full-text search)
CREATE INDEX IF NOT EXISTS idx_transactions_description_gin 
ON public.transactions USING gin(to_tsvector('portuguese', description));

-- 11. Índice B-tree para busca de transações por usuário e descrição
CREATE INDEX IF NOT EXISTS idx_transactions_user_description_btree 
ON public.transactions(user_id, description);

-- ===========================================
-- ESTATÍSTICAS E VERIFICAÇÃO
-- ===========================================

-- Atualizar estatísticas das tabelas para otimização
ANALYZE public.transactions;
ANALYZE public.categories;
ANALYZE public.cards;
ANALYZE public.budgets;
ANALYZE public.recurring_transactions;
ANALYZE public.profiles;

-- Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verificar tamanho dos índices
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexname::regclass) DESC; 