-- ===========================================
-- ÍNDICES ESSENCIAIS PARA PERFORMANCE
-- Script simplificado sem problemas de compatibilidade
-- ===========================================

-- 1. Índice composto mais importante: usuário + data + tipo
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_type 
ON public.transactions(user_id, transaction_date DESC, type);

-- 2. Índice para filtros por categoria
CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date 
ON public.transactions(user_id, category_id, transaction_date DESC);

-- 3. Índice para filtros por cartão
CREATE INDEX IF NOT EXISTS idx_transactions_user_card_date 
ON public.transactions(user_id, card_id, transaction_date DESC);

-- 4. Índice para ordenação com status
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_completed 
ON public.transactions(user_id, transaction_date DESC, is_completed);

-- 5. Índice para transações recorrentes
CREATE INDEX IF NOT EXISTS idx_recurring_user_active_next 
ON public.recurring_transactions(user_id, is_active, next_execution_date);

-- 6. Índice para orçamentos
CREATE INDEX IF NOT EXISTS idx_budgets_user_period_category 
ON public.budgets(user_id, year, month, category_id);

-- 7. Índice para login por username
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower 
ON public.profiles(LOWER(username));

-- Atualizar estatísticas
ANALYZE public.transactions;
ANALYZE public.categories;
ANALYZE public.cards;
ANALYZE public.budgets;
ANALYZE public.recurring_transactions;
ANALYZE public.profiles;

-- Verificar se foram criados
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname; 