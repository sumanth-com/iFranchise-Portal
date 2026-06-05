import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="secondary" className="w-auto px-6">
        Sign out
      </Button>
    </form>
  );
}
