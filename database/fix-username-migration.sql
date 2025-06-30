-- Migração para adicionar campo username e corrigir trigger
-- Execute este arquivo no SQL Editor do Supabase

-- 1. Verificar e adicionar campo username se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
        
        -- Criar índice para busca rápida por username
        CREATE INDEX idx_profiles_username ON public.profiles(username);
        
        -- Atualizar comentário da tabela
        COMMENT ON COLUMN public.profiles.username IS 'Nome de usuário único escolhido pelo usuário (apelido)';
        
        RAISE NOTICE '✅ Coluna username adicionada com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Coluna username já existe';
    END IF;
END $$;

-- 2. Atualizar função handle_new_user para incluir username
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
    
    -- Não criar categorias padrão - deixa o usuário personalizar
    -- PERFORM public.create_default_categories(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Criar função para busca por username ou email
CREATE OR REPLACE FUNCTION public.get_user_by_username_or_email(identifier TEXT)
RETURNS TABLE(user_id UUID, email TEXT, username TEXT, name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.username, p.name
    FROM public.profiles p
    WHERE p.email = identifier OR p.username = identifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Verificar se deu certo
SELECT 
    'Migração concluída!' as status,
    COUNT(*) as total_usuarios,
    COUNT(username) as usuarios_com_username
FROM public.profiles; 