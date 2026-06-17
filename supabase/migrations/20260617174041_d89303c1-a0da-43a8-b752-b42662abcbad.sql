CREATE OR REPLACE FUNCTION public.tg_user_sessions_duration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.logout_at IS NOT NULL THEN
    NEW.duration_seconds := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NEW.logout_at - NEW.login_at)))::integer);
    NEW.last_active_at := COALESCE(NEW.last_active_at, NEW.logout_at);
  ELSE
    NEW.duration_seconds := NULL;
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_user_sessions_duration ON public.user_sessions;
CREATE TRIGGER trg_user_sessions_duration
BEFORE INSERT OR UPDATE ON public.user_sessions
FOR EACH ROW EXECUTE FUNCTION public.tg_user_sessions_duration();

DROP POLICY IF EXISTS "admins update all sessions" ON public.user_sessions;
CREATE POLICY "admins update all sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

UPDATE public.user_sessions
SET logout_at = COALESCE(logout_at, last_active_at, login_at),
    last_active_at = COALESCE(last_active_at, logout_at, login_at)
WHERE logout_at IS NULL
  AND COALESCE(last_active_at, login_at) < now() - interval '10 minutes';