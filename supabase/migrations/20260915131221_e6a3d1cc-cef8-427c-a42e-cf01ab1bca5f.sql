ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS source_from text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source_subject text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source_date timestamptz;

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (key, value)
VALUES ('retailer_terms', 'iherb,amazon,myprotein,holland,vitacost,skroutz,solgar,now foods')
ON CONFLICT (key) DO NOTHING;