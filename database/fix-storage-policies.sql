-- Corrigir políticas RLS do Storage para avatares
-- Execute este script no painel do Supabase para resolver o erro 403

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Verificar se o bucket existe e é público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- Criar políticas corrigidas para o Storage
-- Política para permitir que usuários vejam avatares publicamente
CREATE POLICY "Public Avatar Access" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política para permitir que usuários autenticados façam upload de seus próprios avatares
CREATE POLICY "User Avatar Upload" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir que usuários atualizem seus próprios avatares
CREATE POLICY "User Avatar Update" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir que usuários deletem seus próprios avatares
CREATE POLICY "User Avatar Delete" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%Avatar%'; 