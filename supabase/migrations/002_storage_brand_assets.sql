-- =============================================================================
-- iFranchise Portal — Storage bucket + RLS for brand assets (Stage F)
-- Run in Supabase SQL Editor or via CLI after 001_initial_schema.sql
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path layout: {user_id}/{brand_id}/{asset_type}/{uuid}.{ext}

drop policy if exists "brand_assets_storage_select" on storage.objects;
drop policy if exists "brand_assets_storage_insert" on storage.objects;
drop policy if exists "brand_assets_storage_delete" on storage.objects;

create policy "brand_assets_storage_select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'brand-assets'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "brand_assets_storage_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'brand-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "brand_assets_storage_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'brand-assets'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
