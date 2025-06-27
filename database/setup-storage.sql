-- Configurar Storage para avatares
-- Este script cria o bucket e as políticas necessárias para upload de avatares

-- Criar bucket para avatares (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuários vejam avatares publicamente
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política para permitir que usuários autenticados façam upload de seus próprios avatares
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários deletem seus próprios avatares
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verificar se o bucket foi criado
SELECT id, name, public FROM storage.buckets WHERE id = 'avatars';

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%avatar%'; 