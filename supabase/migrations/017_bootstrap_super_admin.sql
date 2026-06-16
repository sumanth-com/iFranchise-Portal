-- =============================================================================
-- Idempotent bootstrap for the platform Super Admin account.
-- Safe to re-run. Does NOT create auth users or set passwords.
-- Service role only (via RPC grant).
-- =============================================================================

create or replace function public.bootstrap_super_admin_profile(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_user_id uuid;
  v_auth_email text;
  v_profile_exists boolean;
  v_prev_role public.user_role;
  v_prev_team_role public.team_role;
  v_prev_active boolean;
  v_profile_created boolean := false;
  v_role_restored boolean := false;
  v_permissions_initialized boolean := false;
  v_already_healthy boolean := false;
begin
  v_email := lower(trim(p_email));

  if v_email = '' then
    return jsonb_build_object(
      'ok', false,
      'reason', 'invalid_email',
      'email', p_email
    );
  end if;

  select u.id, lower(u.email)
  into v_user_id, v_auth_email
  from auth.users u
  where lower(u.email) = v_email
  order by u.created_at asc
  limit 1;

  if v_user_id is null then
    return jsonb_build_object(
      'ok', false,
      'reason', 'auth_user_missing',
      'email', v_email,
      'actions', '[]'::jsonb
    );
  end if;

  select exists(select 1 from public.profiles p where p.id = v_user_id)
  into v_profile_exists;

  if not v_profile_exists then
    insert into public.profiles (id, email, role, team_role, is_active)
    values (v_user_id, coalesce(v_auth_email, v_email), 'super_admin', 'super_admin', true);

    v_profile_created := true;
  else
    select p.role, p.team_role, p.is_active
    into v_prev_role, v_prev_team_role, v_prev_active
    from public.profiles p
    where p.id = v_user_id;

    if v_prev_role is distinct from 'super_admin'
      or v_prev_team_role is distinct from 'super_admin'
      or v_prev_active is distinct from true then
      update public.profiles
      set
        role = 'super_admin',
        team_role = 'super_admin',
        is_active = true,
        disabled_at = null,
        disabled_by = null,
        updated_at = now()
      where id = v_user_id;

      v_role_restored := true;
    else
      v_already_healthy := true;
    end if;
  end if;

  perform public.initialize_admin_permissions(v_user_id, 'super_admin'::public.team_role);
  v_permissions_initialized := true;

  return jsonb_build_object(
    'ok', true,
    'email', v_email,
    'profile_id', v_user_id,
    'auth_user_found', true,
    'profile_created', v_profile_created,
    'role_restored', v_role_restored,
    'permissions_initialized', v_permissions_initialized,
    'already_healthy', v_already_healthy and not v_profile_created and not v_role_restored,
    'actions', to_jsonb(
      array_remove(
        array[
          case when v_profile_created then 'profile_recreated' end,
          case when v_role_restored then 'role_restored' end,
          case when v_permissions_initialized then 'permissions_initialized' end
        ],
        null
      )
    )
  );
exception
  when undefined_function then
    return jsonb_build_object(
      'ok', false,
      'reason', 'initialize_admin_permissions_missing',
      'email', v_email,
      'profile_id', v_user_id
    );
end;
$$;

comment on function public.bootstrap_super_admin_profile(text) is
  'Ensures the bootstrap Super Admin profile exists with super_admin role. Idempotent; never sets passwords.';

revoke all on function public.bootstrap_super_admin_profile(text) from public;
revoke all on function public.bootstrap_super_admin_profile(text) from authenticated;
grant execute on function public.bootstrap_super_admin_profile(text) to service_role;

-- Convenience view for health checks (service role / SQL editor)
create or replace function public.bootstrap_super_admin_health(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_user_id uuid;
  v_profile record;
begin
  v_email := lower(trim(p_email));

  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  order by u.created_at asc
  limit 1;

  if v_user_id is null then
    return jsonb_build_object(
      'healthy', false,
      'status', 'auth_user_missing',
      'email', v_email
    );
  end if;

  select p.id, p.email, p.role, p.team_role, p.is_active, p.disabled_at
  into v_profile
  from public.profiles p
  where p.id = v_user_id;

  if not found then
    return jsonb_build_object(
      'healthy', false,
      'status', 'profile_missing',
      'email', v_email,
      'profile_id', v_user_id,
      'auth_user_found', true
    );
  end if;

  if v_profile.role = 'super_admin'
    and v_profile.team_role = 'super_admin'
    and v_profile.is_active = true
    and v_profile.disabled_at is null then
    return jsonb_build_object(
      'healthy', true,
      'status', 'healthy',
      'email', v_email,
      'profile_id', v_profile.id,
      'role', v_profile.role,
      'team_role', v_profile.team_role,
      'is_active', v_profile.is_active,
      'auth_user_found', true
    );
  end if;

  return jsonb_build_object(
    'healthy', false,
    'status', 'needs_repair',
    'email', v_email,
    'profile_id', v_profile.id,
    'role', v_profile.role,
    'team_role', v_profile.team_role,
    'is_active', v_profile.is_active,
    'disabled_at', v_profile.disabled_at,
    'auth_user_found', true
  );
end;
$$;

revoke all on function public.bootstrap_super_admin_health(text) from public;
revoke all on function public.bootstrap_super_admin_health(text) from authenticated;
grant execute on function public.bootstrap_super_admin_health(text) to service_role;
