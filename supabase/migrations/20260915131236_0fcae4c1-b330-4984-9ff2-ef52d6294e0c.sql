CREATE POLICY "app_settings service only" ON public.app_settings
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

CREATE POLICY "cron_config service only" ON public.cron_config
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);