/**
 * Precise sidebar active-state matching for the Brand Owner portal.
 * Avoids /dashboard/brands highlighting when on /dashboard/brands/new or /dashboard/brands/[id]/...
 */

export function isNavItemActive(pathname: string, href: string): boolean {
  const path = pathname.split("?")[0];

  if (href === "/dashboard") {
    return path === "/dashboard";
  }

  if (href === "/dashboard/brands") {
    return (
      path === "/dashboard/brands" ||
      /^\/dashboard\/brands\/[^/]+\/edit$/.test(path)
    );
  }

  if (href === "/dashboard/brands/new") {
    return path === "/dashboard/brands/new";
  }

  if (href === "/dashboard/marketplace-preview") {
    return (
      path === "/dashboard/marketplace-preview" ||
      /^\/dashboard\/brands\/[^/]+\/preview$/.test(path)
    );
  }

  if (href === "/dashboard/notifications") {
    return path === "/dashboard/notifications";
  }

  if (href === "/dashboard/settings") {
    return path === "/dashboard/settings";
  }

  if (href === "/dashboard/support") {
    return path === "/dashboard/support";
  }

  if (href === "/dashboard/blog") {
    return path === "/dashboard/blog" || path.startsWith("/dashboard/blog/");
  }

  if (href === "/dashboard/growth-hub") {
    return path === "/dashboard/growth-hub";
  }

  return path === href || path.startsWith(`${href}/`);
}