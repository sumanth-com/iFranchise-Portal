-- =============================================================================
-- Public read access for approved brands (Website Integration)
-- =============================================================================

create policy "brands_select_approved_public"
  on public.brands
  for select
  to anon, authenticated
  using (status = 'approved');

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
    )
  );
