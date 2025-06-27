-- Migração idempotente para adicionar campo username
-- Execute no SQL Editor do Supabase

-- Verificar e adicionar campo username se não existir
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
        COMMENT ON COLUMN public.profiles.username IS 'Nome de usuário único para login alternativo';
    END IF;
END $$;

-- Função para permitir login com username ou email (sempre recriar)
CREATE OR REPLACE FUNCTION public.get_user_by_username_or_email(identifier TEXT)
RETURNS TABLE(user_id UUID, email TEXT, username TEXT, name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.username, p.name
    FROM public.profiles p
    WHERE p.email = identifier OR p.username = identifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Concluído! A migração agora é segura para executar múltiplas vezes 