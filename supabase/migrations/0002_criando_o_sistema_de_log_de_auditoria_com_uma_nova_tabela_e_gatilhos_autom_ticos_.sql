-- 1. Criar um tipo ENUM para as ações, garantindo consistência.
CREATE TYPE public.action_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- 2. Criar a tabela central de auditoria para registrar todas as mudanças.
CREATE TABLE public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp timestamptz NOT NULL DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action public.action_type NOT NULL,
    table_name text NOT NULL,
    record_id text,
    old_record_data jsonb,
    new_record_data jsonb
);

-- 3. Habilitar Row Level Security (RLS) e criar política para que apenas administradores possam ver os logs.
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);

-- 4. Criar a função de gatilho genérica que será usada por todas as tabelas.
CREATE OR REPLACE FUNCTION public.log_audit_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_record_data jsonb;
    v_new_record_data jsonb;
    v_record_id text;
BEGIN
    -- Determinar os dados antigos e novos com base na operação
    IF (TG_OP = 'UPDATE') THEN
        v_old_record_data := to_jsonb(OLD);
        v_new_record_data := to_jsonb(NEW);
        v_record_id := NEW.id::text;
    ELSIF (TG_OP = 'DELETE') THEN
        v_old_record_data := to_jsonb(OLD);
        v_new_record_data := NULL;
        v_record_id := OLD.id::text;
    ELSIF (TG_OP = 'INSERT') THEN
        v_old_record_data := NULL;
        v_new_record_data := to_jsonb(NEW);
        v_record_id := NEW.id::text;
    END IF;

    -- Inserir o registro de auditoria
    INSERT INTO public.audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_record_data,
        new_record_data
    )
    VALUES (
        auth.uid(),
        TG_OP::public.action_type,
        TG_TABLE_NAME::text,
        v_record_id,
        v_old_record_data,
        v_new_record_data
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Criar e anexar os gatilhos para cada tabela que queremos auditar.
-- Tabela: franqueados
CREATE TRIGGER on_franqueados_audit
AFTER INSERT OR UPDATE OR DELETE ON public.franqueados
FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

-- Tabela: unidades
CREATE TRIGGER on_unidades_audit
AFTER INSERT OR UPDATE OR DELETE ON public.unidades
FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

-- Tabela: franqueados_unidades
CREATE TRIGGER on_franqueados_unidades_audit
AFTER INSERT OR UPDATE OR DELETE ON public.franqueados_unidades
FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

-- Tabela: colaboradores_loja
CREATE TRIGGER on_colaboradores_loja_audit
AFTER INSERT OR UPDATE OR DELETE ON public.colaboradores_loja
FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

-- Tabela: colaboradores_interno
CREATE TRIGGER on_colaboradores_interno_audit
AFTER INSERT OR UPDATE OR DELETE ON public.colaboradores_interno
FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

-- Tabela: senhas
CREATE TRIGGER on_senhas_audit
AFTER INSERT OR UPDATE OR DELETE ON public.senhas
FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

-- Tabela: clientes
CREATE TRIGGER on_clientes_audit
AFTER INSERT OR UPDATE OR DELETE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

-- Tabela: clientes_filhos
CREATE TRIGGER on_clientes_filhos_audit
AFTER INSERT OR UPDATE OR DELETE ON public.clientes_filhos
FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();

-- Tabela: franqueados_filhos
CREATE TRIGGER on_franqueados_filhos_audit
AFTER INSERT OR UPDATE OR DELETE ON public.franqueados_filhos
FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();