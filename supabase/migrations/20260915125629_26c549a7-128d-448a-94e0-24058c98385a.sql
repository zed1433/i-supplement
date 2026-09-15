CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.cron_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.cron_config TO service_role;
ALTER TABLE public.cron_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.cron_config (key, value)
VALUES ('base_url', 'https://project--3a22ec09-24a9-45ec-9881-3eb081d306ce.lovable.app')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.trigger_daily_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  base text;
  secret text;
BEGIN
  SELECT value INTO base FROM public.cron_config WHERE key = 'base_url';
  SELECT value INTO secret FROM public.cron_config WHERE key = 'cron_secret';
  IF base IS NULL OR secret IS NULL THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := base || '/api/public/cron/feeds',
    headers := jsonb_build_object('Authorization', 'Bearer ' || secret, 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  PERFORM net.http_post(
    url := base || '/api/public/cron/inbox',
    headers := jsonb_build_object('Authorization', 'Bearer ' || secret, 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_daily_jobs() FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('suppcheck-daily-jobs', '15 4 * * *', $$SELECT public.trigger_daily_jobs();$$);