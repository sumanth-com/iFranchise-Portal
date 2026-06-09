-- =============================================================================
-- STEP 1 of 2 — Add super_admin to user_role enum
-- =============================================================================
-- PostgreSQL requires this to COMMIT before super_admin can be referenced.
-- Run this file ALONE in Supabase SQL Editor, then run 015b.
-- Safe to re-run (idempotent).
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    join pg_namespace n on t.typnamespace = n.oid
    where n.nspname = 'public'
      and t.typname = 'user_role'
      and e.enumlabel = 'super_admin'
  ) then
    alter type public.user_role add value 'super_admin';
  end if;
end $$;
