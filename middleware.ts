import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run auth middleware on app routes only.
     * Exclude static assets, images, and textures to avoid unnecessary Supabase calls.
     */
    "/((?!_next/static|_next/image|favicon.ico|textures|api/|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
