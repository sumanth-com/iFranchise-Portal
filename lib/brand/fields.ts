/** Core brand columns from migration 001. */
export const BRAND_CORE_FIELDS =
  "id, user_id, business_name, tagline, description, website_url, contact_email, contact_phone, industry, status, admin_feedback, submitted_at, reviewed_at, reviewed_by, created_at, updated_at" as const;

/** Extended onboarding columns from migration 006. */
export const BRAND_EXTENDED_FIELDS =
  "category, investment_min, investment_max, franchise_fee, space_required_sqft, roi_percent, payback_period_months, franchise_models, current_outlets, existing_cities, target_cities, expansion_tier_1, expansion_tier_2, expansion_metro, agreement_term_years, lock_in_period_months, publish_ready, published_at" as const;

export const BRAND_FULL_SELECT = `${BRAND_CORE_FIELDS}, ${BRAND_EXTENDED_FIELDS}`;
