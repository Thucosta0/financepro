-- Script de Verificação - FinancePRO Database
-- Execute este script no SQL Editor do Supabase para verificar se tudo foi criado corretamente

-- ===========================================
-- 1. VERIFICAR TABELAS CRIADAS
-- ===========================================

SELECT 'VERIFICANDO TABELAS...' as status;

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'profiles', 
        'categories', 
        'cards', 
        'transactions', 
        'recurring_transactions', 
        'budgets'
    )
ORDER BY tablename;

-- ===========================================
-- 2. VERIFICAR RLS (ROW LEVEL SECURITY)
-- ===========================================

SELECT 'VERIFICANDO RLS...' as status;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'profiles', 
        'categories', 
        'cards', 
        'transactions', 
        'recurring_transactions', 
        'budgets'
    )
ORDER BY tablename;

-- ===========================================
-- 3. VERIFICAR POLÍTICAS RLS
-- ===========================================

SELECT 'VERIFICANDO POLÍTICAS RLS...' as status;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===========================================
-- 4. VERIFICAR ÍNDICES
-- ===========================================

SELECT 'VERIFICANDO ÍNDICES...' as status;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ===========================================
-- 5. VERIFICAR TRIGGERS
-- ===========================================

SELECT 'VERIFICANDO TRIGGERS...' as status;

SELECT 
    event_object_schema as schema,
    event_object_table as table_name,
    trigger_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ===========================================
-- 6. VERIFICAR FUNÇÕES CUSTOMIZADAS
-- ===========================================

SELECT 'VERIFICANDO FUNÇÕES...' as status;

SELECT 
    routine_name as function_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'handle_updated_at',
        'handle_new_user',
        'create_default_categories',
        'create_sample_data'
    )
ORDER BY routine_name;

-- ===========================================
-- 7. VERIFICAR VIEWS DE RELATÓRIO
-- ===========================================

SELECT 'VERIFICANDO VIEWS...' as status;

SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views
WHERE schemaname = 'public'
    AND viewname IN (
        'financial_summary',
        'expenses_by_category',
        'budget_tracking'
    )
ORDER BY viewname;

-- ===========================================
-- 8. VERIFICAR EXTENSÕES
-- ===========================================

SELECT 'VERIFICANDO EXTENSÕES...' as status;

SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname IN ('uuid-ossp')
ORDER BY extname;

-- ===========================================
-- 9. TESTE DE AUTENTICAÇÃO
-- ===========================================

SELECT 'TESTANDO AUTENTICAÇÃO...' as status;

-- Verificar se auth.uid() funciona (deve retornar NULL se não logado)
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'Não logado - OK para teste'
        ELSE 'Usuário logado: ' || auth.uid()::text
    END as auth_status;

-- ===========================================
-- 10. TESTE DE CATEGORIAS PADRÃO (se logado)
-- ===========================================

SELECT 'VERIFICANDO CATEGORIAS PADRÃO...' as status;

-- Só funciona se houver um usuário logado
SELECT 
    COUNT(*) as total_categories,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income_categories,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_categories
FROM categories
WHERE user_id = auth.uid();

-- ===========================================
-- RESULTADO ESPERADO
-- ===========================================

SELECT 'RESULTADO ESPERADO:' as info
UNION ALL
SELECT '- 6 tabelas criadas (profiles, categories, cards, transactions, recurring_transactions, budgets)'
UNION ALL
SELECT '- RLS habilitado em todas as tabelas'
UNION ALL
SELECT '- Múltiplas políticas RLS por tabela'
UNION ALL
SELECT '- Índices idx_* criados'
UNION ALL
SELECT '- Triggers de updated_at em todas as tabelas'
UNION ALL
SELECT '- Trigger on_auth_user_created'
UNION ALL
SELECT '- 4 funções customizadas'
UNION ALL
SELECT '- 3 views de relatório'
UNION ALL
SELECT '- Extensão uuid-ossp instalada'
UNION ALL
SELECT '- auth.uid() funcionando'
UNION ALL
SELECT '- Se logado: 12 categorias padrão criadas';

-- ===========================================
-- COMANDOS ÚTEIS PARA DEBUG
-- ===========================================

-- Para ver todos os usuários cadastrados:
-- SELECT id, email, created_at FROM auth.users;

-- Para criar categorias padrão manualmente (se logado):
-- SELECT public.create_default_categories(auth.uid());

-- Para criar dados de exemplo (se logado):
-- SELECT public.create_sample_data(auth.uid());

-- Para ver dados do usuário atual (se logado):
-- SELECT * FROM profiles WHERE id = auth.uid();
-- SELECT * FROM categories WHERE user_id = auth.uid();
-- SELECT * FROM cards WHERE user_id = auth.uid(); 