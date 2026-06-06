-- =============================================================================
-- brand-assets storage: bucket + RLS (idempotent)
-- Combines 002_storage_brand_assets.sql + 008_storage_pdf_and_limits.sql
-- Run once in Supabase SQL Editor if uploads fail with permission errors.
-- =============================================================================

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

-- Path layout: {user_id}/{brand_id}/{asset_type}/{uuid}.{ext}

drop policy if exists "brand_assets_storage_select" on storage.objects;
drop policy if exists "brand_assets_storage_insert" on storage.objects;
drop policy if exists "brand_assets_storage_delete" on storage.objects;
drop policy if exists "brand_assets_storage_update" on storage.objects;

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

create policy "brand_assets_storage_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'brand-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'brand-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
