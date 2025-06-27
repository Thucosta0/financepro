-- FinancePRO - Script para corrigir problemas com categorias
-- Execute este script no SQL Editor do Supabase se você tiver problemas para editar categorias

-- ===========================================
-- VERIFICAÇÃO E CORREÇÃO DE CATEGORIAS
-- ===========================================

-- 1. Verificar se há categorias sem user_id correto
SELECT 
    id, 
    user_id, 
    name, 
    type,
    created_at
FROM public.categories 
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users);

-- 2. Verificar políticas de RLS ativas
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'categories';

-- 3. Verificar políticas específicas para categories
SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pol.polqual as qual,
    pol.polwithcheck as with_check
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
WHERE pc.relname = 'categories';

-- ===========================================
-- FUNÇÃO PARA RECRIAR CATEGORIAS PADRÃO
-- ===========================================

CREATE OR REPLACE FUNCTION public.recreate_user_categories(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Remove categorias existentes do usuário
    DELETE FROM public.categories WHERE user_id = target_user_id;
    
    -- Recria as categorias padrão
    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (target_user_id, 'Alimentação', 'expense', '🍽️', '#ef4444'),
    (target_user_id, 'Transporte', 'expense', '🚗', '#f97316'),
    (target_user_id, 'Moradia', 'expense', '🏠', '#eab308'),
    (target_user_id, 'Saúde', 'expense', '🏥', '#22c55e'),
    (target_user_id, 'Educação', 'expense', '📚', '#3b82f6'),
    (target_user_id, 'Lazer', 'expense', '🎮', '#8b5cf6'),
    (target_user_id, 'Compras', 'expense', '🛒', '#ec4899'),
    (target_user_id, 'Serviços', 'expense', '🔧', '#6b7280'),
    (target_user_id, 'Salário', 'income', '💰', '#10b981'),
    (target_user_id, 'Freelance', 'income', '💻', '#059669'),
    (target_user_id, 'Investimentos', 'income', '📈', '#0d9488'),
    (target_user_id, 'Outros', 'income', '💼', '#065f46');
    
    RAISE NOTICE 'Categorias recriadas para o usuário %', target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- FUNÇÃO PARA CORRIGIR PERMISSÕES DE USUÁRIO
-- ===========================================

CREATE OR REPLACE FUNCTION public.fix_user_categories()
RETURNS TABLE(user_id UUID, categories_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        COUNT(c.id)::INTEGER as categories_count
    FROM auth.users u
    LEFT JOIN public.categories c ON u.id = c.user_id
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- VERIFICAR CONTEXTO ATUAL DO USUÁRIO
-- ===========================================

-- Para verificar seu próprio user_id, execute:
-- SELECT auth.uid() as my_user_id;

-- Para ver suas categorias:
-- SELECT * FROM public.categories WHERE user_id = auth.uid();

-- Para recriar suas categorias (execute apenas se necessário):
-- SELECT public.recreate_user_categories(auth.uid());

-- ===========================================
-- DIAGNÓSTICO COMPLETO
-- ===========================================

CREATE OR REPLACE FUNCTION public.diagnose_categories()
RETURNS TEXT AS $$
DECLARE
    current_user_id UUID;
    category_count INTEGER;
    policy_count INTEGER;
    result TEXT := '';
BEGIN
    -- Obter user_id atual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN 'ERRO: Usuário não está autenticado. Faça login primeiro.';
    END IF;
    
    -- Contar categorias do usuário
    SELECT COUNT(*) INTO category_count 
    FROM public.categories 
    WHERE user_id = current_user_id;
    
    -- Contar políticas ativas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policy pol
    JOIN pg_class pc ON pol.polrelid = pc.oid
    WHERE pc.relname = 'categories';
    
    result := format('DIAGNÓSTICO DE CATEGORIAS
=========================
User ID: %s
Categorias encontradas: %s
Políticas RLS ativas: %s

', current_user_id, category_count, policy_count);

    IF category_count = 0 THEN
        result := result || 'PROBLEMA: Nenhuma categoria encontrada. Execute: SELECT public.recreate_user_categories(auth.uid());' || chr(10);
    ELSIF category_count < 12 THEN
        result := result || 'AVISO: Poucas categorias encontradas. Pode estar faltando algumas.' || chr(10);
    ELSE
        result := result || 'OK: Categorias encontradas normalmente.' || chr(10);
    END IF;
    
    IF policy_count < 4 THEN
        result := result || 'PROBLEMA: Políticas RLS não estão configuradas corretamente.' || chr(10);
    ELSE
        result := result || 'OK: Políticas RLS ativas.' || chr(10);
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- TESTE RÁPIDO DE EDIÇÃO
-- ===========================================

CREATE OR REPLACE FUNCTION public.test_category_edit()
RETURNS TEXT AS $$
DECLARE
    test_category_id UUID;
    current_user_id UUID;
    result TEXT;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN 'ERRO: Usuário não autenticado';
    END IF;
    
    -- Buscar uma categoria do usuário
    SELECT id INTO test_category_id 
    FROM public.categories 
    WHERE user_id = current_user_id 
    LIMIT 1;
    
    IF test_category_id IS NULL THEN
        RETURN 'ERRO: Nenhuma categoria encontrada para testar';
    END IF;
    
    -- Tentar atualizar a categoria
    BEGIN
        UPDATE public.categories 
        SET updated_at = NOW() 
        WHERE id = test_category_id AND user_id = current_user_id;
        
        IF FOUND THEN
            result := 'SUCESSO: Categoria pode ser editada normalmente';
        ELSE
            result := 'ERRO: Não foi possível editar a categoria (RLS blocking)';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        result := 'ERRO: ' || SQLERRM;
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- INSTRUÇÕES DE USO
-- ===========================================

/*
1. Para diagnosticar problemas:
   SELECT public.diagnose_categories();

2. Para testar se você pode editar categorias:
   SELECT public.test_category_edit();

3. Se as categorias não existirem ou houver problemas, recrie-as:
   SELECT public.recreate_user_categories(auth.uid());

4. Para verificar detalhes das suas categorias:
   SELECT id, name, type, icon, color, created_at 
   FROM public.categories 
   WHERE user_id = auth.uid() 
   ORDER BY type, name;
*/ 