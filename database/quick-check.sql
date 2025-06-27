-- Verificações Rápidas - Execute cada bloco separadamente no SQL Editor

-- ============================================
-- 1. VERIFICAR SE AS TABELAS FORAM CRIADAS
-- ============================================
SELECT 
    expected.tablename,
    CASE WHEN t.tablename IS NOT NULL THEN '✅ Criada' ELSE '❌ Não criada' END as status
FROM (
    VALUES 
        ('profiles'::text),
        ('categories'::text), 
        ('cards'::text),
        ('transactions'::text),
        ('recurring_transactions'::text),
        ('budgets'::text)
) as expected(tablename)
LEFT JOIN pg_tables t ON t.tablename = expected.tablename AND t.schemaname = 'public'
ORDER BY expected.tablename;

-- ============================================
-- 2. VERIFICAR RLS E POLÍTICAS
-- ============================================
SELECT 
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policies_count,
    CASE 
        WHEN t.rowsecurity AND COUNT(p.policyname) > 0 THEN '✅ RLS OK'
        WHEN t.rowsecurity AND COUNT(p.policyname) = 0 THEN '⚠️ RLS sem políticas'
        ELSE '❌ RLS desabilitado'
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public' 
    AND t.tablename IN ('profiles', 'categories', 'cards', 'transactions', 'recurring_transactions', 'budgets')
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- ============================================
-- 3. VERIFICAR FUNÇÕES ESSENCIAIS
-- ============================================
SELECT 
    expected_function,
    CASE WHEN r.routine_name IS NOT NULL THEN '✅ Criada' ELSE '❌ Não criada' END as status
FROM (
    VALUES 
        ('handle_updated_at'),
        ('handle_new_user'),
        ('create_default_categories'),
        ('create_sample_data')
) as expected(expected_function)
LEFT JOIN information_schema.routines r 
    ON r.routine_name = expected.expected_function 
    AND r.routine_schema = 'public'
ORDER BY expected_function;

-- ============================================
-- 4. VERIFICAR EXTENSÃO UUID
-- ============================================
SELECT 
    'uuid-ossp' as extension_name,
    CASE WHEN extname IS NOT NULL THEN '✅ Instalada' ELSE '❌ Não instalada' END as status
FROM pg_extension 
WHERE extname = 'uuid-ossp'
UNION ALL
SELECT 'uuid-ossp', '❌ Não instalada' 
WHERE NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp');

-- ============================================
-- 5. TESTE DE AUTENTICAÇÃO
-- ============================================
SELECT 
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Usuário logado: ' || auth.uid()::text
        ELSE '⚠️ Nenhum usuário logado (normal para teste)'
    END as auth_status;

-- ============================================
-- 6. SE ESTIVER LOGADO - VERIFICAR CATEGORIAS
-- ============================================
-- Execute apenas se estiver logado (se auth.uid() não for NULL)
SELECT 
    COUNT(*) as total_categories,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as receitas,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as despesas,
    CASE 
        WHEN COUNT(*) = 12 THEN '✅ Categorias OK (12 criadas)'
        WHEN COUNT(*) > 0 THEN '⚠️ Algumas categorias (' || COUNT(*) || ' de 12)'
        ELSE '❌ Nenhuma categoria criada'
    END as status
FROM categories 
WHERE user_id = auth.uid();

-- ============================================
-- 7. VERIFICAR VIEWS DE RELATÓRIO
-- ============================================
SELECT 
    expected_view,
    CASE WHEN viewname IS NOT NULL THEN '✅ Criada' ELSE '❌ Não criada' END as status
FROM (
    VALUES 
        ('financial_summary'),
        ('expenses_by_category'),
        ('budget_tracking')
) as expected(expected_view)
LEFT JOIN pg_views v ON v.viewname = expected.expected_view AND v.schemaname = 'public'
ORDER BY expected_view;

-- ============================================
-- RESUMO GERAL
-- ============================================
WITH 
tables_check AS (
    SELECT COUNT(*) as created_tables
    FROM pg_tables 
    WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'categories', 'cards', 'transactions', 'recurring_transactions', 'budgets')
),
functions_check AS (
    SELECT COUNT(*) as created_functions
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
        AND routine_name IN ('handle_updated_at', 'handle_new_user', 'create_default_categories', 'create_sample_data')
),
views_check AS (
    SELECT COUNT(*) as created_views
    FROM pg_views 
    WHERE schemaname = 'public'
        AND viewname IN ('financial_summary', 'expenses_by_category', 'budget_tracking')
),
extension_check AS (
    SELECT COUNT(*) as installed_extensions
    FROM pg_extension 
    WHERE extname = 'uuid-ossp'
)
SELECT 
    '🏆 RESUMO FINAL' as item,
    CASE 
        WHEN t.created_tables = 6 
            AND f.created_functions = 4 
            AND v.created_views = 3 
            AND e.installed_extensions = 1 
        THEN '✅ TUDO OK! Database configurado perfeitamente!'
        ELSE '⚠️ Alguns itens precisam de atenção - verifique acima'
    END as status,
    t.created_tables || '/6 tabelas' as tables_status,
    f.created_functions || '/4 funções' as functions_status,
    v.created_views || '/3 views' as views_status,
    e.installed_extensions || '/1 extensão' as extension_status
FROM tables_check t, functions_check f, views_check v, extension_check e; 