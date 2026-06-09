export function isAdminNavItemActive(pathname: string, href: string): boolean {
  const path = pathname.split("?")[0].split("#")[0];

  if (href === "/admin") {
    return path === "/admin";
  }

  if (href === "/admin/reviews") {
    return path === "/admin/reviews";
  }

  if (href === "/admin/brands") {
    return (
      path === "/admin/brands" ||
      /^\/admin\/brands\/[^/]+$/.test(path)
    );
  }

  if (href === "/admin/notifications") {
    return path === "/admin/notifications";
  }

  if (href === "/admin/leads") {
    return path === "/admin/leads";
  }

  if (href === "/admin/admin-management") {
    return path === "/admin/admin-management";
  }

  if (href === "/admin/team") {
    return path === "/admin/team";
  }

  return path === href || path.startsWith(`${href}/`);
}
