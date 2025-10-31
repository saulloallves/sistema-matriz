-- Atribuir perfil 'admin' para todos os usuários que ainda não possuem perfil
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT p.user_id, 'admin'::app_role
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id
);