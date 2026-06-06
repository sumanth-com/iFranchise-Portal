-- =============================================================================
-- Brand owner RLS — fix "new row violates row-level security policy"
-- =============================================================================
-- Root cause on live DBs provisioned from 001 only:
--   1. is_brand_owner_editable() allowed only draft + changes_requested
--   2. brands_update_own_editable hardcoded the same statuses (ignored 007/010)
--   3. brand_assets INSERT/DELETE call is_brand_owner_editable(brand_id)
-- Owners with status = submitted could not INSERT brand_assets or UPDATE brands.
-- =============================================================================

-- Ownership check (any status except blocked by app)
create or replace function public.is_brand_owned(p_brand_id uuid)
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
  );
$$;

comment on function public.is_brand_owned(uuid) is
  'True when the brand belongs to the current authenticated user.';

-- Editable check — must match types/brand.ts isBrandEditable()
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

-- brands: allow Save Draft / Save & Continue while under review
drop policy if exists "brands_update_own_editable" on public.brands;

create policy "brands_update_own_editable"
  on public.brands
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.is_brand_owner_editable(id)
  )
  with check (
    user_id = auth.uid()
    and status in ('draft', 'rejected', 'submitted', 'changes_requested')
  );

-- brand_assets: INSERT + DELETE already reference is_brand_owner_editable — recreate for clarity
drop policy if exists "brand_assets_insert_own_editable" on public.brand_assets;
drop policy if exists "brand_assets_delete_own_editable" on public.brand_assets;
drop policy if exists "brand_assets_update_own_editable" on public.brand_assets;

create policy "brand_assets_insert_own_editable"
  on public.brand_assets
  for insert
  to authenticated
  with check (public.is_brand_owner_editable(brand_id));

create policy "brand_assets_delete_own_editable"
  on public.brand_assets
  for delete
  to authenticated
  using (public.is_brand_owner_editable(brand_id));

create policy "brand_assets_update_own_editable"
  on public.brand_assets
  for update
  to authenticated
  using (public.is_brand_owner_editable(brand_id))
  with check (public.is_brand_owner_editable(brand_id));

grant update on table public.brand_assets to authenticated;
