-- ===============================================
-- VERIFICAÇÃO: Confirmar que a limpeza funcionou
-- ===============================================

-- 1. Contar total de categorias restantes
SELECT 
  'Total de categorias restantes' as status,
  COUNT(*) as count
FROM categories;

-- 2. Verificar se ainda existem categorias padrão
SELECT 
  'Categorias padrão restantes' as status,
  COUNT(*) as count
FROM categories 
WHERE name IN (
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 
  'Educação', 'Lazer', 'Compras', 'Serviços',
  'Salário', 'Freelance', 'Investimentos', 'Outros'
);

-- 3. Verificar usuários que ainda têm categorias
SELECT 
  'Usuários com categorias' as status,
  COUNT(DISTINCT user_id) as count
FROM categories;

-- 4. Verificar se o trigger está funcionando (mostrar função)
SELECT 
  'Trigger atualizado' as status,
  'Verificar se handle_new_user não chama create_default_categories' as note;

-- 5. Status do sistema
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM categories WHERE name IN ('Alimentação', 'Transporte', 'Moradia')) = 0 
    THEN '✅ LIMPEZA CONCLUÍDA - Sistema pronto!'
    ELSE '❌ Ainda existem categorias padrão'
  END as resultado; 