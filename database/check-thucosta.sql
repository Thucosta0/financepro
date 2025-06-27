-- Script para verificar o usuário thucosta
-- Este script verifica se o username "thucosta" existe na tabela profiles

-- 1. Verificar se existe algum usuário com username "thucosta"
SELECT 
    id,
    name,
    username,
    email,
    created_at,
    updated_at
FROM profiles 
WHERE LOWER(username) = 'thucosta';

-- 2. Verificar se existe algum usuário com email que contenha "thucosta"
SELECT 
    id,
    name,
    username,
    email,
    created_at,
    updated_at
FROM profiles 
WHERE LOWER(email) LIKE '%thucosta%';

-- 3. Listar todos os usuários para comparação
SELECT 
    id,
    name,
    COALESCE(username, 'NULL') as username,
    email,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se a coluna username tem constraint unique
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'profiles' 
    AND contype = 'u'
    AND EXISTS (
        SELECT 1 
        FROM pg_attribute a 
        WHERE a.attrelid = t.oid 
            AND a.attname = 'username'
            AND a.attnum = ANY(c.conkey)
    ); 