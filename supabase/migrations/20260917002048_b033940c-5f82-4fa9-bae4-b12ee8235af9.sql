REVOKE ALL ON FUNCTION public.trigger_daily_jobs() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_daily_jobs() TO service_role, postgres;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

CREATE POLICY "No client role inserts" ON public.user_roles FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No client role updates" ON public.user_roles FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client role deletes" ON public.user_roles FOR DELETE TO anon, authenticated USING (false);