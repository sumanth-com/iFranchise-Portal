# Password recovery — Supabase configuration

Apply these settings in **Supabase Dashboard → Authentication**.

## Redirect URLs (allow list)

Add every environment:

```
http://localhost:3000/reset-password
https://ifranchise-portal.vercel.app/reset-password
https://YOUR-PRODUCTION-DOMAIN/reset-password
https://*-YOUR-VERCEL-TEAM.vercel.app/reset-password
```

Legacy callback (optional, for older emails):

```
http://localhost:3000/auth/callback
https://ifranchise-portal.vercel.app/auth/callback
```

## Site URL

| Environment | Site URL |
|-------------|----------|
| Local | `http://localhost:3000` |
| Production | `https://ifranchise-portal.vercel.app` |

Set `NEXT_PUBLIC_SITE_URL` in Vercel to the production domain (used as fallback for `getOrigin()`).

## resetPasswordForEmail redirectTo

The app sends users **directly** to `/reset-password`:

| Environment | redirectTo |
|-------------|------------|
| Local | `http://localhost:3000/reset-password` |
| Production | `https://ifranchise-portal.vercel.app/reset-password` |

Configured via `buildPasswordResetRedirectUrl()` in `lib/auth/recovery.ts`.

## Recovery email template

1. Open **Authentication → Email Templates → Reset password**
2. **Subject:** `Reset Your iFranchise Password`
3. Paste HTML from `supabase/templates/recovery.html`
4. Ensure the button uses `{{ .ConfirmationURL }}` (Supabase variable)

## Flow

1. User requests reset → email sent with link to `/reset-password`
2. `/reset-password` verifies the recovery token and shows the reset form
3. User sets a new password → success screen → redirect to `/login` after 3 seconds

Passwords are managed only through Supabase Auth — never stored in application code.
