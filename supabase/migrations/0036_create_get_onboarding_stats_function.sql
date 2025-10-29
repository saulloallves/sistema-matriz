-- Cria função RPC otimizada para buscar estatísticas de onboarding
-- Retorna todas as contagens em uma única query usando agregação

CREATE OR REPLACE FUNCTION public.get_onboarding_stats()
RETURNS TABLE(
  total bigint,
  pending bigint,
  approved bigint,
  rejected bigint,
  processing bigint,
  error bigint,
  last_7_days bigint,
  pending_over_48h bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH stats AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE status = 'approved') AS approved,
      COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
      COUNT(*) FILTER (WHERE status = 'processing') AS processing,
      COUNT(*) FILTER (WHERE status = 'error') AS error,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS last_7_days,
      COUNT(*) FILTER (
        WHERE status = 'pending' 
        AND submitted_at < NOW() - INTERVAL '48 hours'
      ) AS pending_over_48h
    FROM public.onboarding_requests
  )
  SELECT * FROM stats;
$$;

-- Comentário para documentação
COMMENT ON FUNCTION public.get_onboarding_stats() IS 
'Retorna estatísticas agregadas das solicitações de onboarding em uma única query otimizada';
