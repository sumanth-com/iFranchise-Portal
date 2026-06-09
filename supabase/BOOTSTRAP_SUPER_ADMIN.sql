-- =============================================================================
-- Bootstrap: promote sumanth.reddy@ifranchise.in to super_admin
-- =============================================================================
-- Prerequisites (run in order, each as a SEPARATE SQL Editor execution):
--   1. supabase/migrations/015a_user_role_add_super_admin.sql
--   2. supabase/migrations/015b_super_admin_hierarchy.sql
--   3. This file
--
-- Does NOT add enum values (that must be committed in 015a first).
-- Does NOT set passwords — user must exist in auth.users.
-- Idempotent: safe to re-run.
-- =============================================================================

update public.profiles
set
  role = 'super_admin',
  team_role = 'super_admin',
  is_active = true,
  disabled_at = null,
  disabled_by = null,
  updated_at = now()
where lower(email) = lower('sumanth.reddy@ifranchise.in')
  and (
    role is distinct from 'super_admin'
    or team_role is distinct from 'super_admin'
    or is_active is distinct from true
  );

-- Verify promotion
select id, email, role, team_role, is_active
from public.profiles
where lower(email) = lower('sumanth.reddy@ifranchise.in');
