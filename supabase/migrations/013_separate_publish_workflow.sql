-- =============================================================================
-- Separate approval from publishing
-- Approved brands are admin-only until explicitly published (published_at set).
-- =============================================================================

-- Stop auto-setting publish_ready on approve; publishing is a separate admin action.
create or replace function public.brands_set_publish_ready_on_approve()
returns trigger
language plpgsql
as $$
begin
  -- Leaving approved clears publish state
  if new.status is distinct from 'approved' then
    new.publish_ready := false;
    new.published_at := null;
  end if;
  return new;
end;
$$;

-- Public website: only published brands (approved + published_at)
drop policy if exists "brands_select_approved_public" on public.brands;
create policy "brands_select_approved_public"
  on public.brands
  for select
  to anon, authenticated
  using (status = 'approved' and published_at is not null);

drop policy if exists "brand_assets_select_approved_public" on public.brand_assets;
create policy "brand_assets_select_approved_public"
  on public.brand_assets
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.brands b
      where b.id = brand_assets.brand_id
        and b.status = 'approved'
        and b.published_at is not null
    )
  );

comment on column public.brands.publish_ready is
  'True when admin has published the brand to the public website.';
comment on column public.brands.published_at is
  'Timestamp when admin published the brand to the public website.';
