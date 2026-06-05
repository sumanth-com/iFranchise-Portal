-- =============================================================================
-- Team Management (roles, invitations, activity logs)
-- =============================================================================

create type public.team_role as enum (
  'super_admin',
  'admin',
  'reviewer',
  'content_manager',
  'support'
);

create type public.invitation_status as enum (
  'pending',
  'accepted',
  'expired',
  'revoked'
);

alter table public.profiles
  add column if not exists team_role public.team_role,
  add column if not exists is_active boolean not null default true,
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_by uuid references public.profiles (id) on delete set null;

comment on column public.profiles.team_role is 'Staff role; null for client accounts.';
comment on column public.profiles.is_active is 'When false, staff cannot access the portal.';

-- Backfill existing admins as team admins
update public.profiles
set team_role = 'admin'
where role = 'admin' and team_role is null;

create table public.team_invitations (
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

create index team_invitations_email_idx on public.team_invitations (lower(email));
create index team_invitations_status_idx on public.team_invitations (status);
create index team_invitations_token_idx on public.team_invitations (token);
create index profiles_team_role_idx on public.profiles (team_role) where team_role is not null;

create trigger team_invitations_set_updated_at
  before update on public.team_invitations
  for each row
  execute function public.set_updated_at();

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index activity_logs_actor_id_idx on public.activity_logs (actor_id);
create index activity_logs_action_idx on public.activity_logs (action);

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
      and team_role is not null
  );
$$;

comment on function public.is_staff() is 'Active staff member (any team role).';

create or replace function public.is_team_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
      and team_role in ('super_admin', 'admin')
  );
$$;

comment on function public.is_team_manager() is 'Can manage team members and invitations.';

create or replace function public.my_team_role()
returns public.team_role
language sql
stable
security definer
set search_path = public
as $$
  select team_role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

-- Keep is_admin() working for existing RLS (all active staff)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_staff();
$$;

-- -----------------------------------------------------------------------------
-- Update profile role protection for team managers
-- -----------------------------------------------------------------------------

create or replace function public.profiles_prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_team_manager() then
    raise exception 'Only team managers can change account roles';
  end if;

  if old.team_role is distinct from new.team_role
     and not public.is_team_manager()
     and auth.uid() = old.id then
    raise exception 'Only team managers can change team roles';
  end if;

  if (old.is_active is distinct from new.is_active
      or old.team_role is distinct from new.team_role)
     and new.team_role = 'super_admin'
     and public.my_team_role() is distinct from 'super_admin' then
    raise exception 'Only super admins can assign the super admin role';
  end if;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Accept team invitation on signup
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.team_invitations%rowtype;
  v_meta_team_role text;
  v_full_name text;
begin
  v_full_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  v_meta_team_role := nullif(trim(coalesce(new.raw_user_meta_data ->> 'team_role', '')), '');

  if v_meta_team_role is not null then
    insert into public.profiles (id, email, full_name, role, team_role)
    values (
      new.id,
      coalesce(new.email, ''),
      v_full_name,
      'admin',
      v_meta_team_role::public.team_role
    );
    return new;
  end if;

  select *
  into v_invitation
  from public.team_invitations
  where lower(email) = lower(coalesce(new.email, ''))
    and status = 'pending'
    and expires_at > now()
  order by created_at desc
  limit 1;

  if found then
    insert into public.profiles (id, email, full_name, role, team_role)
    values (
      new.id,
      coalesce(new.email, ''),
      v_full_name,
      'admin',
      v_invitation.team_role
    );

    update public.team_invitations
    set
      status = 'accepted',
      accepted_at = now(),
      accepted_by = new.id
    where id = v_invitation.id;

    return new;
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    v_full_name,
    'client'
  );

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- RLS: team_invitations
-- -----------------------------------------------------------------------------

alter table public.team_invitations enable row level security;
alter table public.activity_logs enable row level security;

create policy "team_invitations_select_manager"
  on public.team_invitations
  for select
  to authenticated
  using (public.is_team_manager());

create policy "team_invitations_insert_manager"
  on public.team_invitations
  for insert
  to authenticated
  with check (
    public.is_team_manager()
    and invited_by = auth.uid()
  );

create policy "team_invitations_update_manager"
  on public.team_invitations
  for update
  to authenticated
  using (public.is_team_manager())
  with check (public.is_team_manager());

-- -----------------------------------------------------------------------------
-- RLS: activity_logs
-- -----------------------------------------------------------------------------

create policy "activity_logs_select_staff"
  on public.activity_logs
  for select
  to authenticated
  using (public.is_staff());

create policy "activity_logs_insert_staff"
  on public.activity_logs
  for insert
  to authenticated
  with check (
    public.is_staff()
    and actor_id = auth.uid()
  );

-- Staff can read other staff profiles
create policy "profiles_select_staff_team"
  on public.profiles
  for select
  to authenticated
  using (
    public.is_staff()
    and team_role is not null
  );

-- Team managers update staff profiles (role, team_role, is_active)
create policy "profiles_update_team_manager"
  on public.profiles
  for update
  to authenticated
  using (
    public.is_team_manager()
    and team_role is not null
  )
  with check (
    public.is_team_manager()
    and team_role is not null
  );

grant select, insert, update, delete on table public.team_invitations to authenticated;
grant select, insert on table public.activity_logs to authenticated;
grant all on table public.team_invitations to service_role;
grant all on table public.activity_logs to service_role;
