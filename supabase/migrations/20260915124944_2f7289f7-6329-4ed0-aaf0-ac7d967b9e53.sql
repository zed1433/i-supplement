-- product image
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '';

-- admin allowlist
CREATE TABLE public.admin_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_allowlist TO authenticated;
GRANT ALL ON public.admin_allowlist TO service_role;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read allowlist" ON public.admin_allowlist FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.admin_allowlist (email) VALUES ('isupplementsofficial@gmail.com');

-- subscribers
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'subscribed',
  source text NOT NULL DEFAULT 'signup',
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read subscribers" ON public.subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- retailer feeds
CREATE TABLE public.retailer_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name text NOT NULL,
  feed_url text NOT NULL DEFAULT '',
  source_kind text NOT NULL DEFAULT 'url',
  from_email text NOT NULL DEFAULT '',
  mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  last_status text NOT NULL DEFAULT '',
  last_message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.retailer_feeds TO authenticated;
GRANT ALL ON public.retailer_feeds TO service_role;
ALTER TABLE public.retailer_feeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read feeds" ON public.retailer_feeds FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.feed_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid REFERENCES public.retailer_feeds(id) ON DELETE CASCADE,
  trigger text NOT NULL DEFAULT 'cron',
  status text NOT NULL DEFAULT 'running',
  rows_total integer NOT NULL DEFAULT 0,
  rows_matched integer NOT NULL DEFAULT 0,
  rows_updated integer NOT NULL DEFAULT 0,
  unmatched jsonb NOT NULL DEFAULT '[]'::jsonb,
  errors text[] NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
GRANT SELECT ON public.feed_runs TO authenticated;
GRANT ALL ON public.feed_runs TO service_role;
ALTER TABLE public.feed_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read feed runs" ON public.feed_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- job state (single-flight lock + pause)
CREATE TABLE public.job_state (
  job_name text PRIMARY KEY,
  leased_until timestamptz,
  paused boolean NOT NULL DEFAULT false,
  pause_reason text NOT NULL DEFAULT '',
  last_run_at timestamptz,
  last_status text NOT NULL DEFAULT '',
  failures integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.job_state TO authenticated;
GRANT ALL ON public.job_state TO service_role;
ALTER TABLE public.job_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read jobs" ON public.job_state FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.job_state (job_name) VALUES ('feed_sync'), ('inbox_scan');

-- campaigns
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'inbox',
  source_message_id text UNIQUE,
  retailer text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  raw_excerpt text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
GRANT SELECT ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read campaigns" ON public.campaigns FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.campaign_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);
GRANT SELECT ON public.campaign_sends TO authenticated;
GRANT ALL ON public.campaign_sends TO service_role;
ALTER TABLE public.campaign_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read campaign sends" ON public.campaign_sends FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_subscribers_updated BEFORE UPDATE ON public.subscribers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_feeds_updated BEFORE UPDATE ON public.retailer_feeds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();