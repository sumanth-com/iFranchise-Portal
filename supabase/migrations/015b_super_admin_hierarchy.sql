-- =============================================================================
-- STEP 2 of 2 — Super Admin hierarchy (functions, RLS, policies)
-- =============================================================================
-- Prerequisite: 015a committed — user_role enum must include super_admin.
-- Run AFTER 015a_user_role_add_super_admin.sql in a separate SQL Editor run.
-- Safe to re-run (idempotent).
-- Does NOT modify client accounts. Does NOT change existing admin rows unless
-- you run BOOTSTRAP_SUPER_ADMIN.sql separately.
-- =============================================================================

-- Staff helpers
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
      and role in ('admin', 'super_admin')
      and is_active = true
  );
$$;

comment on function public.is_staff() is
  'Active staff member (admin or super_admin).';

create or replace function public.is_super_admin()
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
      and role = 'super_admin'
      and is_active = true
  );
$$;

comment on function public.is_super_admin() is
  'True when the current user is an active super admin.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_staff();
$$;

comment on function public.is_admin() is
  'Alias for is_staff — admin and super_admin with portal access.';

create or replace function public.is_team_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin();
$$;

comment on function public.is_team_manager() is
  'Only super admins manage staff accounts and invitations.';

-- Profile change protection
create or replace function public.profiles_prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_super_admin() then
    raise exception 'Only super admins can change account roles';
  end if;

  if old.team_role is distinct from new.team_role
     and not public.is_super_admin()
     and auth.uid() = old.id then
    raise exception 'Only super admins can change team roles';
  end if;

  if (old.is_active is distinct from new.is_active
      or old.team_role is distinct from new.team_role
      or old.role is distinct from new.role)
     and (new.role = 'super_admin' or new.team_role = 'super_admin')
     and not public.is_super_admin() then
    raise exception 'Only super admins can assign the super admin role';
  end if;

  if old.role = 'super_admin'
     and new.role is distinct from old.role
     and not public.is_super_admin() then
    raise exception 'Only super admins can modify super admin accounts';
  end if;

  return new;
end;
$$;

-- New user handler — staff invitations set role + team_role
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
  v_portal_role public.user_role;
begin
  v_full_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  v_meta_team_role := nullif(trim(coalesce(new.raw_user_meta_data ->> 'team_role', '')), '');
  v_meta_portal_role := nullif(trim(coalesce(new.raw_user_meta_data ->> 'portal_role', '')), '');

  if v_meta_portal_role = 'super_admin' or v_meta_team_role = 'super_admin' then
    insert into public.profiles (id, email, full_name, role, team_role)
    values (
      new.id,
      coalesce(new.email, ''),
      v_full_name,
      'super_admin',
      'super_admin'
    );
    return new;
  end if;

  if v_meta_team_role is not null then
    v_portal_role := 'admin'::public.user_role;

    insert into public.profiles (id, email, full_name, role, team_role)
    values (
      new.id,
      coalesce(new.email, ''),
      v_full_name,
      v_portal_role,
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
    v_portal_role := case
      when v_invitation.team_role = 'super_admin' then 'super_admin'::public.user_role
      else 'admin'::public.user_role
    end;

    insert into public.profiles (id, email, full_name, role, team_role)
    values (
      new.id,
      coalesce(new.email, ''),
      v_full_name,
      v_portal_role,
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

-- RLS — team invitations: super_admin only
drop policy if exists "team_invitations_select_manager" on public.team_invitations;
drop policy if exists "team_invitations_insert_manager" on public.team_invitations;
drop policy if exists "team_invitations_update_manager" on public.team_invitations;
drop policy if exists "team_invitations_select_super_admin" on public.team_invitations;
drop policy if exists "team_invitations_insert_super_admin" on public.team_invitations;
drop policy if exists "team_invitations_update_super_admin" on public.team_invitations;

create policy "team_invitations_select_super_admin"
  on public.team_invitations for select to authenticated
  using (public.is_super_admin());

create policy "team_invitations_insert_super_admin"
  on public.team_invitations for insert to authenticated
  with check (public.is_super_admin() and invited_by = auth.uid());

create policy "team_invitations_update_super_admin"
  on public.team_invitations for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Staff profile management: super_admin only
drop policy if exists "profiles_update_team_manager" on public.profiles;
drop policy if exists "profiles_update_super_admin_staff" on public.profiles;

create policy "profiles_update_super_admin_staff"
  on public.profiles for update to authenticated
  using (
    public.is_super_admin()
    and role in ('admin', 'super_admin')
  )
  with check (
    public.is_super_admin()
    and role in ('admin', 'super_admin')
  );
