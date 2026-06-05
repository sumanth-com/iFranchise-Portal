-- =============================================================================
-- iFranchise Portal — MVP CRM schema (Stage A)
-- Run this entire file in the Supabase SQL Editor (or via Supabase CLI).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('client', 'admin');

create type public.brand_status as enum (
  'draft',
  'submitted',
  'approved',
  'rejected',
  'changes_requested'
);

create type public.asset_type as enum ('logo', 'gallery');

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- profiles: one row per auth.users (created automatically on signup)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App users linked to Supabase Auth; role drives RLS.';

-- brands: one brand per client in MVP (enforced by unique user_id)
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  business_name text not null,
  tagline text,
  description text,
  website_url text,
  contact_email text,
  contact_phone text,
  industry text,
  status public.brand_status not null default 'draft',
  admin_feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brands_user_id_unique unique (user_id)
);

comment on table public.brands is 'Client brand submissions; one per user in MVP.';

-- brand_assets: logo (max one per brand) and gallery images
create table public.brand_assets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  asset_type public.asset_type not null,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0),
  created_at timestamptz not null default now()
);

comment on table public.brand_assets is 'Metadata for files stored in Supabase Storage (bucket configured separately).';

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index profiles_role_idx on public.profiles (role);

create index brands_user_id_idx on public.brands (user_id);
create index brands_status_idx on public.brands (status);
create index brands_submitted_at_idx on public.brands (submitted_at desc nulls last);
create index brands_reviewed_by_idx on public.brands (reviewed_by);

create index brand_assets_brand_id_idx on public.brand_assets (brand_id);
create index brand_assets_brand_id_asset_type_idx on public.brand_assets (brand_id, asset_type);

-- At most one logo row per brand
create unique index brand_assets_one_logo_per_brand_idx
  on public.brand_assets (brand_id)
  where asset_type = 'logo';

-- -----------------------------------------------------------------------------
-- Helper functions (RLS)
-- -----------------------------------------------------------------------------

-- Returns true when the current JWT user has role = admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is 'Used in RLS policies to grant admin access.';

-- Returns true when the brand belongs to the current user and is client-editable
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
      and status in ('draft', 'changes_requested')
  );
$$;

comment on function public.is_brand_owner_editable(uuid) is 'Brand owned by caller and status allows client edits.';

-- -----------------------------------------------------------------------------
-- updated_at trigger function
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger brands_set_updated_at
  before update on public.brands
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Prevent non-admins from changing their own role
-- -----------------------------------------------------------------------------
create or replace function public.profiles_prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Only admins can change user roles';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row
  execute function public.profiles_prevent_role_change();

-- -----------------------------------------------------------------------------
-- Auto-create profile on auth.users signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'client'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.brand_assets enable row level security;

-- =============================================================================
-- profiles policies
-- =============================================================================

-- Users read their own profile; admins read all
create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- Users update their own profile (full_name, email sync optional in app)
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins update any profile (e.g. promote to admin via SQL/dashboard)
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Inserts only via handle_new_user trigger (security definer), not direct client insert

-- =============================================================================
-- brands policies
-- =============================================================================

-- Clients read their own brand
create policy "brands_select_own"
  on public.brands
  for select
  to authenticated
  using (user_id = auth.uid());

-- Admins read all brands
create policy "brands_select_admin"
  on public.brands
  for select
  to authenticated
  using (public.is_admin());

-- Clients create one brand for themselves
create policy "brands_insert_own"
  on public.brands
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Clients update own brand while draft or changes_requested
create policy "brands_update_own_editable"
  on public.brands
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and status in ('draft', 'changes_requested')
  )
  with check (user_id = auth.uid());

-- Admins update any brand (approve, reject, request changes, set feedback)
create policy "brands_update_admin"
  on public.brands
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- brand_assets policies
-- =============================================================================

-- Clients read assets for their own brands
create policy "brand_assets_select_own"
  on public.brand_assets
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.brands b
      where b.id = brand_assets.brand_id
        and b.user_id = auth.uid()
    )
  );

-- Admins read all assets
create policy "brand_assets_select_admin"
  on public.brand_assets
  for select
  to authenticated
  using (public.is_admin());

-- Clients insert assets on editable brands they own
create policy "brand_assets_insert_own_editable"
  on public.brand_assets
  for insert
  to authenticated
  with check (public.is_brand_owner_editable(brand_id));

-- Clients delete assets on editable brands they own
create policy "brand_assets_delete_own_editable"
  on public.brand_assets
  for delete
  to authenticated
  using (public.is_brand_owner_editable(brand_id));

-- -----------------------------------------------------------------------------
-- Grants (Supabase roles)
-- -----------------------------------------------------------------------------
grant usage on schema public to postgres, anon, authenticated, service_role;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.brands to authenticated;
grant select, insert, delete on table public.brand_assets to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.brands to service_role;
grant all on table public.brand_assets to service_role;

grant all on all sequences in schema public to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Post-migration notes (manual steps)
-- -----------------------------------------------------------------------------
-- 1. Promote your first admin (replace with your auth user UUID after signup):
--    update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- 2. Create Storage bucket "brand-assets" (private) and storage RLS in a later migration.
-- =============================================================================
