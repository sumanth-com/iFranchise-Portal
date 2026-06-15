-- =============================================================================
-- Admin platform integration — staff profile fields, permissions, audit support
-- Safe to re-run (idempotent).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles: extended staff fields
-- -----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists phone text,
  add column if not exists department text,
  add column if not exists last_login_at timestamptz;

comment on column public.profiles.phone is 'Staff contact phone; set from invite metadata.';
comment on column public.profiles.department is 'Staff department label for Team Hub.';
comment on column public.profiles.last_login_at is 'Last successful portal login timestamp.';

-- -----------------------------------------------------------------------------
-- admin_permissions
-- -----------------------------------------------------------------------------

create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  permission text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint admin_permissions_profile_permission_unique unique (profile_id, permission)
);

create index if not exists admin_permissions_profile_id_idx
  on public.admin_permissions (profile_id);

alter table public.admin_permissions enable row level security;

grant select, insert, update, delete on table public.admin_permissions to authenticated;
grant all on table public.admin_permissions to service_role;

drop policy if exists "admin_permissions_select_super_admin" on public.admin_permissions;
drop policy if exists "admin_permissions_select_self" on public.admin_permissions;
drop policy if exists "admin_permissions_manage_super_admin" on public.admin_permissions;

create policy "admin_permissions_select_super_admin"
  on public.admin_permissions for select to authenticated
  using (public.is_super_admin());

create policy "admin_permissions_select_self"
  on public.admin_permissions for select to authenticated
  using (profile_id = auth.uid());

create policy "admin_permissions_manage_super_admin"
  on public.admin_permissions for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- -----------------------------------------------------------------------------
-- leads: optional admin assignment (if leads table exists)
-- -----------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'leads'
  ) then
    alter table public.leads
      add column if not exists assigned_admin_id uuid references public.profiles (id) on delete set null;

    create index if not exists leads_assigned_admin_id_idx
      on public.leads (assigned_admin_id);
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- Default permissions for new staff accounts
-- -----------------------------------------------------------------------------

create or replace function public.initialize_admin_permissions(
  p_profile_id uuid,
  p_team_role public.team_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_permission text;
  v_permissions text[] := array[
    'review_brands',
    'approve_brands',
    'manage_leads',
    'view_analytics',
    'manage_team',
    'send_messages'
  ];
begin
  foreach v_permission in array v_permissions
  loop
    insert into public.admin_permissions (profile_id, permission, enabled)
    values (
      p_profile_id,
      v_permission,
      case
        when p_team_role = 'super_admin' then true
        when v_permission = 'manage_team' then false
        else true
      end
    )
    on conflict (profile_id, permission) do nothing;
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- handle_new_user — persist phone/department + permissions for staff
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
  v_meta_portal_role text;
  v_full_name text;
  v_phone text;
  v_department text;
  v_portal_role public.user_role;
  v_team_role public.team_role;
begin
  v_full_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  v_phone := nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '');
  v_department := nullif(trim(coalesce(new.raw_user_meta_data ->> 'department', '')), '');
  v_meta_team_role := nullif(trim(coalesce(new.raw_user_meta_data ->> 'team_role', '')), '');
  v_meta_portal_role := nullif(trim(coalesce(new.raw_user_meta_data ->> 'portal_role', '')), '');

  if v_meta_portal_role = 'super_admin' or v_meta_team_role = 'super_admin' then
    insert into public.profiles (id, email, full_name, role, team_role, phone, department)
    values (
      new.id,
      coalesce(new.email, ''),
      v_full_name,
      'super_admin',
      'super_admin',
      v_phone,
      coalesce(v_department, 'C Suite')
    );

    perform public.initialize_admin_permissions(new.id, 'super_admin');
    return new;
  end if;

  if v_meta_team_role is not null then
    v_portal_role := 'admin'::public.user_role;
    v_team_role := v_meta_team_role::public.team_role;

    insert into public.profiles (id, email, full_name, role, team_role, phone, department)
    values (
      new.id,
      coalesce(new.email, ''),
      v_full_name,
      v_portal_role,
      v_team_role,
      v_phone,
      coalesce(v_department, 'Operations')
    );

    perform public.initialize_admin_permissions(new.id, v_team_role);
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
    v_portal_role := case
      when v_invitation.team_role = 'super_admin' then 'super_admin'::public.user_role
      else 'admin'::public.user_role
    end;

    insert into public.profiles (id, email, full_name, role, team_role, phone, department)
    values (
      new.id,
      coalesce(new.email, ''),
      v_full_name,
      v_portal_role,
      v_invitation.team_role,
      v_phone,
      coalesce(v_department, 'Operations')
    );

    perform public.initialize_admin_permissions(new.id, v_invitation.team_role);

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

-- Realtime publication (ignore if already added)
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.team_invitations;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.activity_logs;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$$;
