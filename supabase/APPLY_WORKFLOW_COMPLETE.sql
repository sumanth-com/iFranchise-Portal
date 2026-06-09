-- =============================================================================
-- iFranchise Portal — Complete workflow migrations (run once in SQL Editor)
-- Includes: RLS fixes, onboarding fields, publish workflow, marketplace slug, leads
-- Safe to re-run: idempotent statements only.
-- =============================================================================

-- ── From APPLY_TO_PRODUCTION.sql ─────────────────────────────────────────────
alter type public.asset_type add value if not exists 'store_photo';
alter type public.asset_type add value if not exists 'product_photo';
alter type public.asset_type add value if not exists 'document';

create or replace function public.is_brand_owned(p_brand_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.brands where id = p_brand_id and user_id = auth.uid());
$$;

create or replace function public.is_brand_owner_editable(p_brand_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.brands
    where id = p_brand_id and user_id = auth.uid()
      and status in ('draft', 'rejected', 'submitted', 'changes_requested')
  );
$$;

drop policy if exists "brands_update_own_editable" on public.brands;
create policy "brands_update_own_editable" on public.brands for update to authenticated
  using (user_id = auth.uid() and public.is_brand_owner_editable(id))
  with check (user_id = auth.uid() and status in ('draft', 'rejected', 'submitted', 'changes_requested'));

drop policy if exists "brand_assets_insert_own_editable" on public.brand_assets;
drop policy if exists "brand_assets_delete_own_editable" on public.brand_assets;
drop policy if exists "brand_assets_update_own_editable" on public.brand_assets;

create policy "brand_assets_insert_own_editable" on public.brand_assets for insert to authenticated
  with check (public.is_brand_owner_editable(brand_id));
create policy "brand_assets_delete_own_editable" on public.brand_assets for delete to authenticated
  using (public.is_brand_owner_editable(brand_id));
create policy "brand_assets_update_own_editable" on public.brand_assets for update to authenticated
  using (public.is_brand_owner_editable(brand_id))
  with check (public.is_brand_owner_editable(brand_id));

grant update on table public.brand_assets to authenticated;

-- ── Migration 006: onboarding fields ───────────────────────────────────────────
alter table public.brands
  add column if not exists category text,
  add column if not exists investment_min numeric,
  add column if not exists investment_max numeric,
  add column if not exists franchise_fee numeric,
  add column if not exists space_required_sqft integer,
  add column if not exists roi_percent numeric,
  add column if not exists payback_period_months integer,
  add column if not exists franchise_models text[] not null default '{}',
  add column if not exists current_outlets integer,
  add column if not exists existing_cities text[] not null default '{}',
  add column if not exists target_cities text[] not null default '{}',
  add column if not exists expansion_tier_1 text[] not null default '{}',
  add column if not exists expansion_tier_2 text[] not null default '{}',
  add column if not exists expansion_metro text[] not null default '{}',
  add column if not exists agreement_term_years integer,
  add column if not exists lock_in_period_months integer,
  add column if not exists publish_ready boolean not null default false,
  add column if not exists published_at timestamptz;

-- ── Migration 007: multi-brand ─────────────────────────────────────────────────
alter table public.brands drop constraint if exists brands_user_id_unique;

-- ── Migration 013: separate publish workflow ─────────────────────────────────
create or replace function public.brands_set_publish_ready_on_approve()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from 'approved' then
    new.publish_ready := false;
    new.published_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists brands_publish_ready_on_approve on public.brands;
create trigger brands_publish_ready_on_approve
  before update on public.brands for each row
  execute function public.brands_set_publish_ready_on_approve();

drop policy if exists "brands_select_approved_public" on public.brands;
create policy "brands_select_approved_public" on public.brands for select to anon, authenticated
  using (status = 'approved' and published_at is not null);

drop policy if exists "brand_assets_select_approved_public" on public.brand_assets;
create policy "brand_assets_select_approved_public" on public.brand_assets for select to anon, authenticated
  using (exists (
    select 1 from public.brands b
    where b.id = brand_assets.brand_id and b.status = 'approved' and b.published_at is not null
  ));

-- ── Migration 014: marketplace slug + leads ────────────────────────────────────
alter table public.brands add column if not exists slug text;

create unique index if not exists brands_slug_unique on public.brands (slug) where slug is not null;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  city text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  source text not null default 'marketplace',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_brand_id_idx on public.leads (brand_id);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public" on public.leads for insert to anon, authenticated
  with check (exists (
    select 1 from public.brands b
    where b.id = brand_id and b.status = 'approved' and b.published_at is not null
  ));

drop policy if exists "leads_select_admin" on public.leads;
create policy "leads_select_admin" on public.leads for select to authenticated
  using (public.is_admin());

drop policy if exists "leads_update_admin" on public.leads;
create policy "leads_update_admin" on public.leads for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "leads_select_own_brand" on public.leads;
create policy "leads_select_own_brand" on public.leads for select to authenticated
  using (exists (
    select 1 from public.brands b
    where b.id = leads.brand_id and b.user_id = auth.uid()
  ));

drop policy if exists "leads_update_own_brand" on public.leads;
create policy "leads_update_own_brand" on public.leads for update to authenticated
  using (exists (
    select 1 from public.brands b
    where b.id = leads.brand_id and b.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.brands b
    where b.id = leads.brand_id and b.user_id = auth.uid()
  ));

-- Done. Verify: npx tsx scripts/validate-workflow-e2e.ts
