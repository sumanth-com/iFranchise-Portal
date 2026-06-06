-- Ensure brochure and onboarding asset types exist on live databases
-- that were provisioned before migration 006 was applied.

alter type public.asset_type add value if not exists 'store_photo';
alter type public.asset_type add value if not exists 'product_photo';
alter type public.asset_type add value if not exists 'document';
