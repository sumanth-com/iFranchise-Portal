-- =============================================================================
-- Staff account fields (schema only — no profile data changes)
-- =============================================================================
-- Adds columns and supporting objects required by:
--   - 015b_super_admin_hierarchy.sql
--   - BOOTSTRAP_SUPER_ADMIN.sql
--   - admin management / staff activation
--
-- Safe to re-run (idempotent).
-- Does NOT update existing profiles (no role or team_role backfill).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

do $$
begin
  create type public.team_role as enum (
    'super_admin',
    'admin',
    'reviewer',
    'content_manager',
    'support'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.invitation_status as enum (
    'pending',
    'accepted',
    'expired',
    'revoked'
  );
exception
  when duplicate_object then null;
end
$$;

-- -----------------------------------------------------------------------------
-- profiles: staff account columns
-- -----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists team_role public.team_role,
  add column if not exists is_active boolean not null default true,
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_by uuid references public.profiles (id) on delete set null;

comment on column public.profiles.team_role is
  'Staff role; null for client accounts.';

comment on column public.profiles.is_active is
  'When false, staff cannot access the portal.';

comment on column public.profiles.disabled_at is
  'When the staff account was deactivated.';

comment on column public.profiles.disabled_by is
  'Super admin who deactivated this staff account.';

create index if not exists profiles_team_role_idx
  on public.profiles (team_role)
  where team_role is not null;

-- -----------------------------------------------------------------------------
-- team_invitations (admin invite flow)
-- -----------------------------------------------------------------------------

create table if not exists public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  team_role public.team_role not null,
  invited_by uuid not null references public.profiles (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_invitations_email_idx
  on public.team_invitations (lower(email));

create index if not exists team_invitations_status_idx
  on public.team_invitations (status);

create index if not exists team_invitations_token_idx
  on public.team_invitations (token);

drop trigger if exists team_invitations_set_updated_at on public.team_invitations;

create trigger team_invitations_set_updated_at
  before update on public.team_invitations
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- activity_logs (admin / team audit trail)
-- -----------------------------------------------------------------------------

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx
  on public.activity_logs (created_at desc);

create index if not exists activity_logs_actor_id_idx
  on public.activity_logs (actor_id);

create index if not exists activity_logs_action_idx
  on public.activity_logs (action);

-- -----------------------------------------------------------------------------
-- RLS + grants (tables only; staff policies come from 015b / 004)
-- -----------------------------------------------------------------------------

alter table public.team_invitations enable row level security;
alter table public.activity_logs enable row level security;

grant select, insert, update, delete on table public.team_invitations to authenticated;
grant select, insert on table public.activity_logs to authenticated;
grant all on table public.team_invitations to service_role;
grant all on table public.activity_logs to service_role;

-- Minimal activity_logs policies (no dependency on is_staff(); 015b replaces team_invitation policies)
drop policy if exists "activity_logs_select_staff" on public.activity_logs;
drop policy if exists "activity_logs_insert_staff" on public.activity_logs;

create policy "activity_logs_select_staff"
  on public.activity_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role::text in ('admin', 'super_admin')
        and p.is_active = true
    )
  );

create policy "activity_logs_insert_staff"
  on public.activity_logs
  for insert
  to authenticated
  with check (
    actor_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role::text in ('admin', 'super_admin')
        and p.is_active = true
    )
  );
