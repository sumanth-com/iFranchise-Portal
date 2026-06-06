-- =============================================================================
-- iFranchise Portal — RUN ONCE in Supabase SQL Editor
-- =============================================================================
-- Fixes all known production blockers for brand wizard + uploads:
--   • asset_type enum (document for brochure PDF)
--   • brand owner RLS (submitted brands can upload assets + save drafts)
--   • storage bucket policies (if not already applied)
--
-- Safe to re-run: all statements are idempotent.
-- =============================================================================

-- 1) Asset type enum (brochure = document)
alter type public.asset_type add value if not exists 'store_photo';
alter type public.asset_type add value if not exists 'product_photo';
alter type public.asset_type add value if not exists 'document';

-- 2) Brand owner RLS helpers + policies
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

-- 3) Storage bucket (brand-assets)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  false,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "brand_assets_storage_select" on storage.objects;
drop policy if exists "brand_assets_storage_insert" on storage.objects;
drop policy if exists "brand_assets_storage_delete" on storage.objects;
drop policy if exists "brand_assets_storage_update" on storage.objects;

create policy "brand_assets_storage_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'brand-assets'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "brand_assets_storage_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'brand-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "brand_assets_storage_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'brand-assets'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "brand_assets_storage_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'brand-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'brand-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Done. Verify with: npx tsx scripts/verify-production-db.ts
