-- Verificação Simples - Execute um comando por vez no SQL Editor do Supabase

-- 1️⃣ VERIFICAR TABELAS (execute este primeiro)
SELECT 'Verificando tabelas...' as etapa;

SELECT COUNT(*) as total_tabelas_criadas
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'categories', 'cards', 'transactions', 'recurring_transactions', 'budgets');

-- Deve retornar: 6

-- 2️⃣ LISTAR TABELAS CRIADAS
SELECT tablename as tabela_criada
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'categories', 'cards', 'transactions', 'recurring_transactions', 'budgets')
ORDER BY tablename;

-- Deve mostrar: budgets, cards, categories, profiles, recurring_transactions, transactions

-- 3️⃣ VERIFICAR EXTENSÃO UUID
SELECT extname as extensao, extversion as versao
FROM pg_extension 
WHERE extname = 'uuid-ossp';

-- Deve retornar: uuid-ossp com alguma versão

-- 4️⃣ VERIFICAR FUNÇÕES
SELECT COUNT(*) as total_funcoes_criadas
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_updated_at', 'handle_new_user', 'create_default_categories', 'create_sample_data');

-- Deve retornar: 4

-- 5️⃣ LISTAR FUNÇÕES CRIADAS
SELECT routine_name as funcao_criada
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_updated_at', 'handle_new_user', 'create_default_categories', 'create_sample_data')
ORDER BY routine_name;

-- Deve mostrar: create_default_categories, create_sample_data, handle_new_user, handle_updated_at

-- 6️⃣ VERIFICAR VIEWS
SELECT COUNT(*) as total_views_criadas
FROM pg_views 
WHERE schemaname = 'public'
  AND viewname IN ('financial_summary', 'expenses_by_category', 'budget_tracking');

-- Deve retornar: 3

-- 7️⃣ VERIFICAR RLS
SELECT tablename, rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'categories', 'cards', 'transactions', 'recurring_transactions', 'budgets')
ORDER BY tablename;

-- Todas devem ter rls_habilitado = true

-- 8️⃣ TESTE DE AUTENTICAÇÃO
SELECT auth.uid() as meu_user_id;

-- Se retornar NULL = não está logado (normal)
-- Se retornar um UUID = está logado

-- 9️⃣ SE ESTIVER LOGADO - VERIFICAR CATEGORIAS (só funciona se auth.uid() não for NULL)
SELECT COUNT(*) as minhas_categorias
FROM categories 
WHERE user_id = auth.uid();

-- Se logado, deve retornar 12 (categorias padrão criadas automaticamente)

-- 🔟 RESUMO FINAL - EXECUTE POR ÚLTIMO
SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'categories', 'cards', 'transactions', 'recurring_transactions', 'budgets')) as tabelas,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('handle_updated_at', 'handle_new_user', 'create_default_categories', 'create_sample_data')) as funcoes,
  (SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public' AND viewname IN ('financial_summary', 'expenses_by_category', 'budget_tracking')) as views,
  (SELECT COUNT(*) FROM pg_extension WHERE extname = 'uuid-ossp') as extensoes;

-- RESULTADO ESPERADO: 6 tabelas, 4 funções, 3 views, 1 extensão 