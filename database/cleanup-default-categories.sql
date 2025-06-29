-- ===============================================
-- LIMPEZA COMPLETA: REMOVER CATEGORIAS PADRÃO
-- ===============================================
-- Esta migração vai deixar TODAS as contas limpas
-- Usuários existentes também ficarão sem categorias padrão

-- 1. DELETAR todas as categorias padrão que se repetem
DELETE FROM categories 
WHERE name IN (
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 
  'Educação', 'Lazer', 'Compras', 'Serviços',
  'Salário', 'Freelance', 'Investimentos', 'Outros'
);

-- 2. ATUALIZAR trigger para NÃO criar categorias automáticas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Cria apenas o perfil do usuário (SEM categorias)
    INSERT INTO public.profiles (id, name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email)
    ON CONFLICT (id) DO NOTHING;
    
    -- NÃO cria categorias padrão - deixa o usuário personalizar
    -- PERFORM public.create_default_categories(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. GARANTIR que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. OPCIONAL: Também remover função de categorias padrão (se quiser)
-- DROP FUNCTION IF EXISTS public.create_default_categories(uuid);

-- 5. VERIFICAÇÃO: Contar categorias restantes
DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM categories;
    RAISE NOTICE 'Categorias restantes após limpeza: %', category_count;
END $$; 