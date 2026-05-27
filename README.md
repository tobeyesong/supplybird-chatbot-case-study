# ModHaus Catalog

Next.js App Router + Tailwind catalog for an Orange County, California building supply reseller.

## Stack

- Next.js + Tailwind CSS
- Supabase Postgres, Auth, and Storage
- Vercel-ready deployment
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
3. Create one owner user in Supabase Auth.
4. Add these values to `.env.local` and Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_PHONE_NUMBER=+17145550138
NEXT_PUBLIC_CHATBOT_EMBED_SRC=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported if the project still uses legacy anon key naming.

## Routes

- `/` public home
- `/shop/[category]` public category pages
- `/shop/[category]/[slug]` public product detail pages
- `/about` public business page
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
