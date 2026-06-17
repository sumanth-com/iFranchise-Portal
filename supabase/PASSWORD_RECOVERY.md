# Password recovery — Supabase configuration

Apply these settings in **Supabase Dashboard → Authentication**.

## Redirect URLs (allow list)

Add every environment:

```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
https://YOUR-PRODUCTION-DOMAIN/auth/callback
https://YOUR-PRODUCTION-DOMAIN/reset-password
https://*-YOUR-VERCEL-TEAM.vercel.app/auth/callback
https://*-YOUR-VERCEL-TEAM.vercel.app/reset-password
```

For Vercel preview deployments, add your preview URL pattern or each preview domain.

## Site URL

| Environment | Site URL |
|-------------|----------|
| Local | `http://localhost:3000` |
| Production | `https://YOUR-PRODUCTION-DOMAIN` |

Set `NEXT_PUBLIC_SITE_URL` in Vercel to the production domain (used as fallback for `getOrigin()`).

## Recovery email template

1. Open **Authentication → Email Templates → Reset password**
2. **Subject:** `Reset Your iFranchise Password`
3. Paste HTML from `supabase/templates/recovery.html`
4. Ensure the button uses `{{ .ConfirmationURL }}` (Supabase variable)

## Flow

1. User requests reset → email sent with link to `/auth/callback?next=/reset-password`
2. Callback (or `/login` / `/` with tokens) establishes recovery session → `/reset-password`
3. User sets new password → redirected to `/login` with success message

If Supabase **Site URL** is the app root (`https://your-domain.com`), recovery links that land on `/` are automatically forwarded to `/auth/callback` with tokens preserved.

## Token handling

The app accepts recovery sessions via:

- URL hash (`#access_token=…&type=recovery`) — implicit flow
- `?code=…` — PKCE (browser or server exchange)
- `?token_hash=…&type=recovery` — OTP verify

Passwords are managed only through Supabase Auth — never stored in application code.
