
-- 1. has_role: only allow callers to check their own roles (service_role exempt)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND _user_id IS DISTINCT FROM auth.uid() THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- 2. subscribers: no direct client writes
REVOKE ALL ON public.subscribers FROM anon, authenticated;
GRANT SELECT ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;

DROP POLICY IF EXISTS "No client subscriber inserts" ON public.subscribers;
DROP POLICY IF EXISTS "No client subscriber updates" ON public.subscribers;
DROP POLICY IF EXISTS "No client subscriber deletes" ON public.subscribers;
CREATE POLICY "No client subscriber inserts" ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No client subscriber updates" ON public.subscribers FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client subscriber deletes" ON public.subscribers FOR DELETE TO anon, authenticated USING (false);

-- 3. admin_allowlist: read-only for signed-in admins, writes server-side only
REVOKE ALL ON public.admin_allowlist FROM anon, authenticated;
GRANT SELECT ON public.admin_allowlist TO authenticated;
GRANT ALL ON public.admin_allowlist TO service_role;

-- 4. user_roles: enforce allowlist linkage for admin grants at the database level
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_admin_allowlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_email text;
BEGIN
  IF NEW.role <> 'admin'::app_role THEN
    RETURN NEW;
  END IF;

  SELECT lower(u.email) INTO target_email FROM auth.users u WHERE u.id = NEW.user_id;

  IF target_email IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.admin_allowlist a WHERE lower(a.email) = target_email
  ) THEN
    RAISE EXCEPTION 'Admin role can only be granted to allow-listed accounts';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_admin_allowlist() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_user_roles_admin_allowlist ON public.user_roles;
CREATE TRIGGER trg_user_roles_admin_allowlist
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_admin_allowlist();
