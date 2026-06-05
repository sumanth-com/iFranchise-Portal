-- Allow authenticated users to self-heal a missing profile row (OAuth / legacy accounts).

create or replace function public.ensure_own_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user auth.users%rowtype;
  v_profile public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_profile from public.profiles where id = auth.uid();
  if found then
    return v_profile;
  end if;

  select * into v_user from auth.users where id = auth.uid();
  if not found then
    raise exception 'User not found';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    v_user.id,
    coalesce(v_user.email, ''),
    nullif(trim(coalesce(v_user.raw_user_meta_data ->> 'full_name', '')), ''),
    'client'
  )
  returning * into v_profile;

  return v_profile;
end;
$$;

comment on function public.ensure_own_profile() is
  'Creates a client profile for the current user when the signup trigger did not run.';

grant execute on function public.ensure_own_profile() to authenticated;
