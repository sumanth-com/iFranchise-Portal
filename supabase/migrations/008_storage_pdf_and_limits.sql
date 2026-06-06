-- Extend brand-assets bucket for brochure PDFs (up to 20MB) and ensure bucket exists.

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

-- Allow authenticated owners to update/replace their own objects
drop policy if exists "brand_assets_storage_update" on storage.objects;

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
