CREATE TABLE public.calculator_workspaces (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calculator_workspaces TO authenticated;
GRANT ALL ON public.calculator_workspaces TO service_role;
ALTER TABLE public.calculator_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own workspace select" ON public.calculator_workspaces FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own workspace insert" ON public.calculator_workspaces FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own workspace update" ON public.calculator_workspaces FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own workspace delete" ON public.calculator_workspaces FOR DELETE TO authenticated USING (auth.uid() = user_id);