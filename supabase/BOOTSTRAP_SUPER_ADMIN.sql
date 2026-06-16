-- =============================================================================
-- Bootstrap: promote sumanth.reddy@ifranchise.in to super_admin
-- =============================================================================
-- Prefer running migration 017_bootstrap_super_admin.sql (creates RPC functions).
-- This file is a thin SQL Editor wrapper — idempotent, safe to re-run.
-- Does NOT set passwords — manage via Supabase Auth / password reset.
-- =============================================================================

select public.bootstrap_super_admin_profile('sumanth.reddy@ifranchise.in');

select public.bootstrap_super_admin_health('sumanth.reddy@ifranchise.in');
