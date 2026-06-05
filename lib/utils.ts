export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function getGreeting(name?: string | null) {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = name?.split(" ")[0]?.trim();
  return first ? `${time}, ${first}` : time;
}
