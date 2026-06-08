export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function resolveFirstName(
  fullName?: string | null,
  email?: string | null,
): string {
  const first = fullName?.split(/\s+/)[0]?.trim();
  if (first) return first;
  const fromEmail = email?.split("@")[0]?.trim();
  if (fromEmail) {
    return fromEmail.charAt(0).toUpperCase() + fromEmail.slice(1);
  }
  return "there";
}

export function getGreeting(name?: string | null) {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = resolveFirstName(name);
  return first !== "there" ? `${time}, ${first}` : time;
}
