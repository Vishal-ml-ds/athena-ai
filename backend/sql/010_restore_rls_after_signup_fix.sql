-- Run AFTER deploying the signup fix in backend/app/routers/auth.py + dependencies.py.
-- Restores RLS on tenants + profiles that was disabled as an emergency workaround.
-- Also drops the throwaway INSERT policies added during the same incident.

DROP POLICY IF EXISTS tenants_insert_authenticated ON tenants;
DROP POLICY IF EXISTS tenants_insert_anon ON tenants;
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_anon ON profiles;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
