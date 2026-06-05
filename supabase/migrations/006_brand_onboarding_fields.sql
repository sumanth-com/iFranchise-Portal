-- =============================================================================
-- Brand onboarding fields — investment, franchise model, expansion, publish
-- =============================================================================

-- Extend asset types for store photos, product photos, documents
alter type public.asset_type add value if not exists 'store_photo';
alter type public.asset_type add value if not exists 'product_photo';
alter type public.asset_type add value if not exists 'document';

-- Brand profile extensions
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

comment on column public.brands.publish_ready is
  'True when approved and ready for sync to iFranchise website.';
comment on column public.brands.franchise_models is
  'Selected models: FOFO, FICO, FOCO, unit, master';

-- Auto-set publish_ready when admin approves
create or replace function public.brands_set_publish_ready_on_approve()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    new.publish_ready := true;
  end if;
  if new.status is distinct from 'approved' then
    new.publish_ready := false;
    new.published_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists brands_publish_ready_on_approve on public.brands;
create trigger brands_publish_ready_on_approve
  before update on public.brands
  for each row
  execute function public.brands_set_publish_ready_on_approve();
