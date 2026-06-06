-- Multi-brand support: one client can own many franchise listings.
-- Edit rules: draft, rejected, submitted (under review), changes_requested.

alter table public.brands drop constraint if exists brands_user_id_unique;

comment on table public.brands is 'Client franchise listings; multiple brands per user.';

create or replace function public.is_brand_owner_editable(p_brand_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.brands
    where id = p_brand_id
      and user_id = auth.uid()
      and status in ('draft', 'rejected', 'submitted', 'changes_requested')
  );
$$;

comment on function public.is_brand_owner_editable(uuid) is
  'Brand owned by caller and status allows client edits (not approved).';
