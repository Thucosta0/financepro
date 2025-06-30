-- Script para testar funcionalidade de username
-- Execute após aplicar a migração fix-username-migration.sql

-- 1. Verificar se a coluna username foi criada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name = 'username';

-- 2. Verificar índice criado
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname = 'idx_profiles_username';

-- 3. Listar todos os usuários e seus usernames
SELECT 
    id,
    name,
    email,
    username,
    CASE 
        WHEN username IS NULL THEN '❌ SEM USERNAME'
        WHEN username = '' THEN '⚠️ USERNAME VAZIO'
        ELSE '✅ COM USERNAME'
    END as status_username,
    created_at
FROM public.profiles
ORDER BY created_at DESC;

-- 4. Contar usuários por status
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

-- 5. Verificar se há usernames duplicados
SELECT 
    username, 
    COUNT(*) as quantidade,
    ARRAY_AGG(email) as emails
FROM public.profiles 
WHERE username IS NOT NULL 
AND username != ''
GROUP BY username
HAVING COUNT(*) > 1;

-- 6. Testar função de busca por username
-- (Descomente e substitua 'teste_usuario' por um username real se existir)
-- SELECT * FROM public.get_user_by_username_or_email('teste_usuario');

-- 7. Verificar se trigger está ativo
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 8. Resumo final
SELECT 
    '🎯 Resumo da verificação' as titulo,
    (SELECT COUNT(*) FROM public.profiles) as total_usuarios,
    (SELECT COUNT(*) FROM public.profiles WHERE username IS NOT NULL) as usuarios_com_username,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'username'
        ) THEN '✅ Coluna username existe'
        ELSE '❌ Coluna username não existe'
    END as status_coluna,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created'
        ) THEN '✅ Trigger ativo'
        ELSE '❌ Trigger não encontrado'
    END as status_trigger; 