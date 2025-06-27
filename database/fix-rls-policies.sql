-- Corrigir políticas RLS para permitir login por username
-- Este script permite que usuários leiam a tabela profiles para autenticação

-- Primeiro, vamos ver as políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Criar política para permitir leitura de profiles para login
-- Usuários autenticados podem ler usernames/emails para autenticação
CREATE POLICY "Allow authenticated users to read profiles for login" ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Política para permitir que usuários vejam/editem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política para permitir que usuários atualizem apenas seu próprio perfil  
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verificar as políticas após criação
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles'; 