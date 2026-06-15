import { LogoutControl } from "@/components/auth/logout-control";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  userId?: string | null;
};

export function LogoutButton({ userId }: LogoutButtonProps) {
  return (
    <LogoutControl userId={userId}>
      <Button type="submit" variant="secondary" className="w-auto px-6">
        Sign out
      </Button>
    </LogoutControl>
  );
}
