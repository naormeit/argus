# Production setup — audit fixes (23 November 2026)

This file covers the code changes made in the `fix/production-audit` branch and
the dashboard steps that must be completed by the account owner.

---

## 1. What changed in code

### Billing and webhooks

- `backend/main.py`
  - Lemon Squeezy webhook events are claimed in a `webhook_events` table before
    processing. Duplicate deliveries return `{"received": true, "duplicate": true}`
    and cannot grant credits twice.
  - If a handler raises, the claim is released and the endpoint returns 500 so
    Lemon Squeezy can retry.
  - `subscription_cancelled` keeps `plan = 'pro'` and sets
    `subscription_ends_at`; access is checked against that timestamp instead of
    downgrading immediately. `subscription_expired` / `unpaid` downgrade.
  - `subscription_resumed`, `subscription_paused` and
    `subscription_payment_failed` are handled explicitly.
  - Audit credits are refunded when the pipeline fails, and when a block
    explorer or GitHub fetch fails before the pipeline starts.
  - `/reports` now returns only the authenticated user's audits
    (`list_audits_for_user`). `/audits/me` is unchanged.
  - FastAPI docs (`/docs`, `/openapi.json`) are disabled unless
    `ENABLE_API_DOCS=true`.
- `backend/billing.py`
  - Pro access is computed from plan + status + `subscription_ends_at`.
  - New `refund_credit()`; `add_credits()` provisions a missing row.
  - `set_subscription_cancelled()` keeps Pro until the paid period ends.
- `backend/database.py`
  - `claim_webhook_event()` / `release_webhook_event()`.
- `supabase/billing_migration.sql`
  - Adds `subscription_ends_at`, creates `webhook_events`, enables RLS on
    `user_credits` with a read-own-row policy. Safe to re-run.
- `supabase/schema.sql`
  - Enables RLS on `audits` with owner-only select/insert policies.

### Frontend, SEO and legal

- `frontend/vercel.json`
  - Adds `/api/webhooks/:path*` proxy (backup route) and explicit SPA rewrites
    for `/audit`, `/login`, `/reset-password`, `/dashboard`, `/success`,
    `/github`, `/admin`, `/report/*`.
  - Removes the catch-all rewrite, so unknown paths fall through to
    `dist/404.html` (real 404 status).
  - Adds security headers, immutable asset caching and `X-Robots-Tag: noindex`
    for private routes.
- Per-route metadata via `react-helmet-async` (`src/components/RouteMeta.tsx`):
  title, description, canonical, Open Graph, Twitter cards, robots, and JSON-LD
  on the home page. Canonicals and sitemap use `VITE_SITE_URL`.
- Marketing pages are prerendered at build time
  (`scripts/prerender.mjs` + `scripts/generate-seo.mjs` + `scripts/chrome.mjs`)
  into `dist/index.html`, `dist/pricing/index.html`, `dist/about/`,
  `dist/contact/`, `dist/privacy/`, `dist/terms/` and `dist/404.html`.
- New pages: `/about`, `/contact`, `/reset-password`, real 404. Shared
  `SiteFooter` (with a "Privacy settings" control) and a legal rewrite of
  `/privacy` and `/terms` with the real processors (Supabase, Render, Vercel,
  Lemon Squeezy, Groq, block explorers, GitHub) and a working contact email.
- Password reset: login sends `redirectTo=/reset-password`; that page exchanges
  the Supabase recovery session and calls `auth.updateUser({ password })`. Old
  links to `/login?mode=update-password` are forwarded automatically.
- Fonts are self-hosted through `@fontsource` (Latin subsets); the Google Fonts
  requests are gone.
- `frontend/public/`: `robots.txt`, `sitemap.xml`, `favicon.svg`,
  `favicon-32.png`, `apple-touch-icon.png`, `og.png`, `site.webmanifest`.

---

## 2. Database migrations (Supabase SQL Editor)

Run both files, in this order:

1. `supabase/schema.sql`
2. `supabase/billing_migration.sql`

Both are idempotent. Verify afterwards:

```sql
select column_name from information_schema.columns
where table_name = 'user_credits' and column_name = 'subscription_ends_at';

select to_regclass('public.webhook_events');
```

---

## 3. Render environment

Service: `argus-backend` (`https://argus-backend-1ge3.onrender.com`).

Set / confirm:

| Variable | Value |
| --- | --- |
| `FRONTEND_URL` | `https://<your-domain>` (fall back to the Vercel URL until the domain is live) |
| `CORS_ORIGINS` | `https://<your-domain>,https://www.<your-domain>,https://frontend-eight-theta-43.vercel.app` |
| `ENABLE_API_DOCS` | `false` |
| `LS_WEBHOOK_SECRET` | signing secret from the Lemon Squeezy webhook |
| `ADMIN_EMAIL` | the Supabase account email that may open `/admin` |

`render.yaml` already declares `FRONTEND_URL`, `CORS_ORIGINS` and
`ENABLE_API_DOCS`.

---

## 4. Lemon Squeezy webhook

In Lemon Squeezy → Settings → Webhooks:

- **Callback URL:** `https://argus-backend-1ge3.onrender.com/webhooks/lemonsqueezy`
- **Signing secret:** copy into Render `LS_WEBHOOK_SECRET`.
- **Events:** `order_created`, `subscription_created`, `subscription_updated`,
  `subscription_cancelled`, `subscription_resumed`, `subscription_expired`,
  `subscription_paused`, `subscription_payment_failed`.

Keep the webhook pointed at Render directly. The `/api/webhooks/*` Vercel
rewrite is only a fallback for clients that cannot reach Render; it is not the
primary endpoint.

Proof the endpoint is reachable and enforcing signatures:

```bash
curl -i -X POST https://argus-backend-1ge3.onrender.com/webhooks/lemonsqueezy \
  -H "Content-Type: application/json" \
  -H "X-Signature: invalid" \
  -d '{}'
# expect: HTTP/1.1 400 ... {"detail":"Invalid signature."}
```

Then send a real test order/subscription from Lemon Squeezy test mode and check
Render logs for `LS: added ... credits` or `LS: activated Pro subscription`.
Replaying the same event should log `duplicate webhook ... ignored`.

---

## 5. Supabase Auth URLs

Supabase → Authentication → URL Configuration:

- **Site URL:** `https://<your-domain>`
- **Redirect URLs:**
  - `https://<your-domain>/reset-password`
  - `https://<your-domain>/dashboard`
  - `https://frontend-eight-theta-43.vercel.app/reset-password`
  - `https://frontend-eight-theta-43.vercel.app/dashboard`
  - `http://localhost:5173/reset-password`
  - `http://localhost:5173/dashboard`
  - preview pattern such as `https://*.vercel.app/**` if previews must support auth

Keep "Confirm email" enabled. A custom SMTP provider is strongly recommended:
the built-in mailer is rate-limited and unreliable for password resets.

Recovery email template must use `{{ .ConfirmationURL }}`. The app supplies the
redirect (`/reset-password`) when calling `resetPasswordForEmail`.

---

## 6. Vercel project and custom domain

### Environment variables

Set for Production (and Preview if desired), then redeploy:

| Variable | Value |
| --- | --- |
| `VITE_SITE_URL` | `https://<your-domain>` (no trailing slash) |
| `VITE_CONTACT_EMAIL` | `necrospre@gmail.com` until a domain mailbox exists |
| `VITE_SUPABASE_URL` | existing Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | existing anon key |

`VITE_SITE_URL` controls canonical URLs, Open Graph URLs, JSON-LD, sitemap and
robots.txt. Changing only the domain in DNS is not enough — set this variable
and redeploy so the build regenerates the prerendered HTML.

### Domain

1. Buy the domain from Cloudflare Registrar, Porkbun or Namecheap.
2. Vercel → Project → Settings → Domains → add the apex and `www`.
3. Create the DNS records **exactly as Vercel displays them** (the dashboard
   shows the current A / AAAA / CNAME targets; do not copy stale values from
   blog posts).
4. Wait for "Valid Configuration", then set the primary domain and redirect the
   other hostname to it.
5. Update Render (`FRONTEND_URL`, `CORS_ORIGINS`), Supabase redirect URLs and
   the Lemon Squeezy store URL / checkout redirects.
6. Update `VITE_SITE_URL` and redeploy.

### Build behaviour

`npm run build` = TypeScript check → Vite build → SEO file generation →
prerender. The prerender step launches Chrome:

- local: `CHROME_PATH` or a standard Chrome install;
- CI/Linux: falls back to `@sparticuz/chromium`.

If Chrome cannot launch in your build environment, set `SKIP_PRERENDER=1` to
ship the SPA shell only (marketing pages then rely on client-side metadata).

---

## 7. Email / contact address

`necrospre@gmail.com` is used as the working contact address because
`argus.app` currently has no MX records. If you buy a domain and want
`security@` or `privacy@` addresses:

1. Enable Cloudflare Email Routing (or another forwarder) for the domain.
2. Forward the address to a mailbox you actually read.
3. Send a test message and confirm delivery.
4. Set `VITE_CONTACT_EMAIL` in Vercel and redeploy, then search the repo for the
   old address.

Do not publish domain email addresses before MX records exist.

---

## 8. Verification checklist

```bash
# Home and marketing pages are prerendered and canonical
curl -s https://<domain>/            | grep -E "<title>|canonical|og:image"
curl -s https://<domain>/pricing     | grep -E "<title>|canonical"
curl -s https://<domain>/privacy     | grep -i lemon
curl -s https://<domain>/robots.txt
curl -s https://<domain>/sitemap.xml

# Real 404 (expect HTTP 404, not the homepage)
curl -s -o /dev/null -w "%{http_code}\n" https://<domain>/not-a-real-page

# API proxy still works
curl -s https://<domain>/api/health
curl -s -o /dev/null -w "%{http_code}\n" https://<domain>/api/reports   # 401

# Webhook reaches Render and rejects a bad signature
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  https://argus-backend-1ge3.onrender.com/webhooks/lemonsqueezy \
  -H "X-Signature: invalid" -d '{}'                                     # 400
```

Manual checks:

- Sign up, confirm email, run one audit, confirm the credit decreases.
- Force a pipeline failure (e.g. invalid model key in a staging deployment) and
  confirm the credit returns.
- Complete a test credit purchase and a test subscription; confirm credits /
  Pro appear once even if the webhook is replayed from the Lemon Squeezy
  dashboard.
- Cancel the test subscription and confirm Pro remains until
  `subscription_ends_at`.
- Request a password reset, open the newest email link, set a new password, and
  sign in.
- Open `/reports` with two accounts and confirm each sees only its own audits.
- Search Console: submit `https://<domain>/sitemap.xml`, request indexing for
  `/`, `/pricing`, `/about`, `/contact`.
