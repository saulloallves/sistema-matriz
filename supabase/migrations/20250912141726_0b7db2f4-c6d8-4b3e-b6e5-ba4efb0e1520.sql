-- Habilitar RLS nas tabelas existentes que não têm
ALTER TABLE public.franqueados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franqueados_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades_grupos_whatsapp ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para franqueados
CREATE POLICY "Usuários autenticados podem ver todos os franqueados" 
ON public.franqueados 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem inserir franqueados" 
ON public.franqueados 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar franqueados" 
ON public.franqueados 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem deletar franqueados" 
ON public.franqueados 
FOR DELETE 
TO authenticated 
USING (true);

-- Políticas RLS para unidades
CREATE POLICY "Usuários autenticados podem ver todas as unidades" 
ON public.unidades 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem inserir unidades" 
ON public.unidades 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar unidades" 
ON public.unidades 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem deletar unidades" 
ON public.unidades 
FOR DELETE 
TO authenticated 
USING (true);

-- Políticas RLS para franqueados_unidades
CREATE POLICY "Usuários autenticados podem ver franqueados_unidades" 
ON public.franqueados_unidades 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem inserir franqueados_unidades" 
ON public.franqueados_unidades 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar franqueados_unidades" 
ON public.franqueados_unidades 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem deletar franqueados_unidades" 
ON public.franqueados_unidades 
FOR DELETE 
TO authenticated 
USING (true);

-- Políticas RLS para unidades_grupos_whatsapp
CREATE POLICY "Usuários autenticados podem ver grupos whatsapp" 
ON public.unidades_grupos_whatsapp 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem inserir grupos whatsapp" 
ON public.unidades_grupos_whatsapp 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar grupos whatsapp" 
ON public.unidades_grupos_whatsapp 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem deletar grupos whatsapp" 
ON public.unidades_grupos_whatsapp 
FOR DELETE 
TO authenticated 
USING (true);

-- Corrigir search_path nas funções existentes
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir profile apenas se os dados necessários estiverem disponíveis
  IF NEW.raw_user_meta_data ? 'full_name' AND NEW.raw_user_meta_data ? 'phone_number' THEN
    INSERT INTO public.profiles (user_id, full_name, phone_number, created_by)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'phone_number',
      COALESCE((NEW.raw_user_meta_data->>'created_by')::UUID, NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;