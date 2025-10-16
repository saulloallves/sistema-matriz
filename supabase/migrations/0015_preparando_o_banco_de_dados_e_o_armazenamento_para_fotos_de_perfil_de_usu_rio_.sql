-- Adiciona a coluna para armazenar a URL da foto de perfil na tabela de perfis.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Cria o bucket de armazenamento para as fotos dos usuários do sistema, se ainda não existir.
INSERT INTO storage.buckets (id, name, public)
VALUES ('internal_users', 'internal_users', true)
ON CONFLICT (id) DO NOTHING;

-- Define políticas de segurança para o bucket 'internal_users'.
-- Permite que usuários autenticados visualizem seus próprios avatares.
CREATE POLICY "allow_authenticated_select_own_avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'internal_users' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Permite que usuários autenticados insiram seus próprios avatares.
CREATE POLICY "allow_authenticated_insert_own_avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'internal_users' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Permite que usuários autenticados atualizem seus próprios avatares.
CREATE POLICY "allow_authenticated_update_own_avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'internal_users' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Permite que usuários autenticados removam seus próprios avatares.
CREATE POLICY "allow_authenticated_delete_own_avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'internal_users' AND auth.uid() = (storage.foldername(name))[1]::uuid);