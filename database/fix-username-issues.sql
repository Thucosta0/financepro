-- Script para verificar e corrigir problemas com usernames
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a coluna username existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name = 'username';

-- 2. Verificar usuários sem username
SELECT 
    id,
    name,
    email,
    username,
    CASE 
        WHEN username IS NULL THEN 'SEM USERNAME'
        WHEN username = '' THEN 'USERNAME VAZIO'
        ELSE 'COM USERNAME'
    END as status
FROM public.profiles
ORDER BY created_at DESC;

-- 3. Contar usuários por status de username
SELECT 
    CASE 
        WHEN username IS NULL THEN 'SEM USERNAME'
        WHEN username = '' THEN 'USERNAME VAZIO'
        ELSE 'COM USERNAME'
    END as status,
    COUNT(*) as quantidade
FROM public.profiles
GROUP BY 
    CASE 
        WHEN username IS NULL THEN 'SEM USERNAME'
        WHEN username = '' THEN 'USERNAME VAZIO'
        ELSE 'COM USERNAME'
    END;

-- 4. Verificar se há usernames duplicados
SELECT username, COUNT(*) as quantidade
FROM public.profiles 
WHERE username IS NOT NULL 
AND username != ''
GROUP BY username
HAVING COUNT(*) > 1;

-- 5. Testar busca por username (substitua 'teste_usuario' por um username real)
-- SELECT email, username, name 
-- FROM public.profiles 
-- WHERE username = 'teste_usuario';

-- 6. Se precisar adicionar a coluna username (caso não exista)
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 7. Se precisar criar o índice
-- CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Concluído! Execute as queries acima uma por vez para diagnosticar o problema. 