-- Align DB RLS with app rules: owners may edit assets while brand is not approved.
-- Required when migration 007 was not applied to the live database.

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
