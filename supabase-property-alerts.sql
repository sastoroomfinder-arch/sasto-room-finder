-- Sasto Room Finder: client property alerts
CREATE TABLE IF NOT EXISTS public.property_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  location text,
  property_type text,
  min_price numeric,
  max_price numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_alerts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS property_alerts_active_idx ON public.property_alerts(active);
CREATE INDEX IF NOT EXISTS property_alerts_created_at_idx ON public.property_alerts(created_at DESC);

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

GRANT INSERT ON public.property_alerts TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.property_alerts TO authenticated;

DROP POLICY IF EXISTS "public can create property alerts" ON public.property_alerts;
CREATE POLICY "public can create property alerts"
ON public.property_alerts FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admins can view property alerts" ON public.property_alerts;
CREATE POLICY "admins can view property alerts"
ON public.property_alerts FOR SELECT
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "admins can update property alerts" ON public.property_alerts;
CREATE POLICY "admins can update property alerts"
ON public.property_alerts FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "admins can delete property alerts" ON public.property_alerts;
CREATE POLICY "admins can delete property alerts"
ON public.property_alerts FOR DELETE
TO authenticated
USING (public.is_admin_user());
