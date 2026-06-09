export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function brandSlugFromName(businessName: string, brandId: string): string {
  const base = slugify(businessName);
  return base || brandId.slice(0, 8);
}
