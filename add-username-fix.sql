-- SCRIPT PARA CORRIGIR O PROBLEMA DO USERNAME
-- Execute este script no SQL Editor do Supabase Dashboard
-- Site: https://financepro.dev.br (ou acesse via Supabase Dashboard)

-- ==================================================
-- 1. ADICIONAR COLUNA USERNAME À TABELA PROFILES
-- ==================================================

-- Adicionar coluna username (pode ser NULL)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Adicionar comentário
COMMENT ON COLUMN public.profiles.username IS 'Nome de usuário único escolhido pelo usuário (apelido)';

-- ==================================================
-- 2. CORRIGIR TRIGGER PARA SALVAR USERNAME AUTOMATICAMENTE
-- ==================================================

-- Atualizar função para incluir username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Cria o perfil do usuário incluindo username se fornecido
    INSERT INTO public.profiles (id, name, username, email)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'), 
        NEW.raw_user_meta_data->>'username',
        NEW.email
    );
    
    -- Cria as categorias padrão
    PERFORM public.create_default_categories(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se o trigger existe e recriar se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================================================
-- 3. VERIFICAR SE A MIGRAÇÃO FOI APLICADA
-- ==================================================

-- Verificar se a coluna username existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'username';

-- Verificar se o trigger existe
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ==================================================
-- 4. TESTAR O SISTEMA (OPCIONAL)
-- ==================================================

-- Ver perfis existentes
SELECT id, name, username, email, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- ==================================================
-- CONCLUÍDO!
-- ==================================================

-- Após executar este script:
-- 1. O campo 'username' estará disponível na tabela profiles
-- 2. Novos usuários terão o username salvo automaticamente
-- 3. A página de boas-vindas mostrará o username corretamente
-- 4. Não há mais dependência do localStorage para o nome do usuário

SELECT 'MIGRAÇÃO CONCLUÍDA COM SUCESSO! ✅' AS status; 