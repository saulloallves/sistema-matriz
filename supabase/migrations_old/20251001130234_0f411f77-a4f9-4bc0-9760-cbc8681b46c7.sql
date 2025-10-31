-- Adicionar trigger para disparar webhook após mudanças na tabela franqueados
CREATE TRIGGER franqueados_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.franqueados
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_table_changes();

-- Adicionar triggers para outras tabelas de pessoas também (clientes, colaboradores)
CREATE TRIGGER clientes_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_table_changes();

CREATE TRIGGER colaboradores_interno_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.colaboradores_interno
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_table_changes();

CREATE TRIGGER colaboradores_loja_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.colaboradores_loja
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_table_changes();