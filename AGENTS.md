<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Authentication architecture (do not break)

See `.cursor/rules/auth-stability.mdc` for full requirements. Summary:

| Layer | Location | Purpose |
|-------|----------|---------|
| Auth | `middleware.ts`, `lib/supabase/middleware.ts`, `lib/auth/*`, `lib/supabase/{server,client,env}.ts`, `app/auth/callback/` | Sessions, cookies, route protection, role redirects |
| Business | `lib/*/actions.ts`, `lib/dashboard/*`, server pages that call `requireClient` / `requireAdmin` | Data fetching and mutations |
| Presentation | `components/**`, dashboard/admin layouts (visual only) | UI — must not embed auth logic |

**Roles:** `client` (Brand Owner) → `/dashboard`; `admin` → `/admin`. Protected paths enforced in middleware and `lib/auth/session.ts`.

**UI work:** presentation changes only. Never modify auth layer files unless explicitly requested.
