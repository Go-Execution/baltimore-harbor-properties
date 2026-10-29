# Production configuration

Add the following variables in **Vercel → Project → Settings → Environment Variables**. Enable them for Production, Preview, and Development unless you intentionally want separate Supabase projects.

| Variable | Required | Visibility | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public | Canonical website origin, currently `https://baltimore-harbor-properties.vercel.app`. Replace it with the custom domain later. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public | Supabase publishable/anon key used by the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Secret | Server-only database key for validated form and admin routes. Never prefix it with `NEXT_PUBLIC_`. |
| `ADMIN_NOTIFICATION_EMAIL` | Yes | Server-only | Inbox that receives booking, inquiry, review, and contact notifications. |
| `RESEND_API_KEY` | When email is enabled | Secret | Resend server API key. The database and dashboards work without it; email jobs stay pending until it is configured. |
| `EMAIL_FROM` | When email is enabled | Server-only | Verified sender, for example `Baltimore Harbor Properties <bookings@yourdomain.com>`. |

Do not add the PostgreSQL database password to Vercel. The application does not need it. Do not expose the Supabase service-role key in browser code.

## Custom domain checklist

1. Connect the domain in Vercel and wait for its SSL certificate.
2. Change `NEXT_PUBLIC_SITE_URL` to the final `https://` origin and redeploy.
3. In Supabase Auth URL Configuration, set **Site URL** to the same origin.
4. Add `https://yourdomain.com/**` to **Redirect URLs** while keeping the Vercel URL as a fallback.
5. In Resend, verify the sending domain and update `EMAIL_FROM` to an address on that domain.

## First admin account

Create the user with email/password in Supabase Authentication, then promote the matching row in `public.profiles` to the `admin` role. The admin dashboard can subsequently change other user roles and property-owner assignments.

