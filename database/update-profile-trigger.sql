-- Atualização do trigger para incluir username
-- Execute no SQL Editor do Supabase

-- Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Atualizar função para incluir username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Cria o perfil do usuário incluindo username se fornecido
    INSERT INTO public.profiles (id, name, username, email)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data->>'name', 
        NEW.raw_user_meta_data->>'username',
        NEW.email
    );
    
    -- Não criar categorias automáticas - conta limpa
    -- PERFORM public.create_default_categories(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Concluído! 