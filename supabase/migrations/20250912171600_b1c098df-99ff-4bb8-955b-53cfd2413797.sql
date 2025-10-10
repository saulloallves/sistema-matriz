-- Atualizar o trigger handle_new_user para incluir notes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Inserir profile apenas se os dados necessários estiverem disponíveis
  IF NEW.raw_user_meta_data ? 'full_name' AND NEW.raw_user_meta_data ? 'phone_number' THEN
    INSERT INTO public.profiles (user_id, full_name, phone_number, notes, created_by)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'phone_number',
      NEW.raw_user_meta_data->>'notes',
      COALESCE((NEW.raw_user_meta_data->>'created_by')::UUID, NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$function$;