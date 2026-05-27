# ModHaus Catalog

Next.js App Router + Tailwind catalog for an Orange County, California building supply reseller.

## Stack

- Next.js + Tailwind CSS
- Supabase Postgres, Auth, and Storage
- Netlify-ready deployment
- Sitewide chatbot widget with call and chat contact CTAs

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Add these values to `.env.local` and Netlify:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_PHONE_NUMBER=+19499430957
NEXT_PUBLIC_CHATBOT_EMBED_SRC=
NEXT_PUBLIC_SITE_URL=
OWNER_INVITE_CODE=
OWNER_ACCESS_SECRET=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported if the project still uses legacy anon key naming.

To let the client create the single owner login, send them:

```text
/admin/create-account?code=OWNER_INVITE_CODE
```

After the owner account exists, rotate or remove `OWNER_INVITE_CODE` so the account creation URL cannot be reused. Keep `OWNER_ACCESS_SECRET` unchanged because it validates the existing owner login.

## Lead Notifications

The chatbot submits to the Netlify Form named `modhaus-chat`. Add a Netlify form submission email notification for that form and send it to `modhausllc@gmail.com`.

## Routes

- `/` public home
- `/shop/[category]` public category pages
- `/shop/[category]/[slug]` public product detail pages
- `/about` public business page
- `/admin/create-account` invite-only owner signup
- `/admin/login` owner login
- `/admin` owner inventory page
- `/admin/products/new` add product
- `/admin/products/[id]` edit product

## Calculator

Product detail pages use:

```ts
boxes = Math.ceil((squareFeet * 1.10) / coverage_per_box)
```

The admin product form exposes `coverage_per_box`, so each listing can drive its own calculator.
