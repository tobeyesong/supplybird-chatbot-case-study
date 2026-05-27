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
NEXT_PUBLIC_TEXT_NUMBER=+19499430957
NEXT_PUBLIC_EMAIL_ADDRESS=modhausllc@gmail.com
NEXT_PUBLIC_CHATBOT_EMBED_SRC=
NEXT_PUBLIC_SITE_URL=
OWNER_INVITE_CODE=
OWNER_ACCESS_SECRET=
ADMIN_ALLOWED_EMAILS=
TWILIO_ACCOUNT_SID=
TWILIO_API_KEY_SID=
TWILIO_API_KEY_SECRET=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=+12729991986
TWILIO_OWNER_TO_NUMBER=+19499430957
TWILIO_WEBHOOK_SECRET=
TWILIO_WEBHOOK_AUTH_TOKEN=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported if the project still uses legacy anon key naming.

To let the client create the single owner login, send them:

```text
/admin/create-account?code=OWNER_INVITE_CODE
```

After the owner account exists, rotate or remove `OWNER_INVITE_CODE` so the account creation URL cannot be reused. Keep `OWNER_ACCESS_SECRET` unchanged because it validates the existing owner login.

Use `ADMIN_ALLOWED_EMAILS` for explicit creator/admin access, for example `you@example.com,owner@example.com`.

## Lead Notifications

The chatbot submits to the Netlify Form named `modhaus-chat`. Add a Netlify form submission email notification for that form and send it to `modhausllc@gmail.com`.

`NEXT_PUBLIC_TEXT_NUMBER` is the public click-to-text number shown to shoppers. `TWILIO_FROM_NUMBER` is only the Twilio-owned sender used for server-side SMS notifications.

The no-payment contact flow lets the shopper choose one channel. Text opens the shopper's SMS app with a prefilled message addressed to `NEXT_PUBLIC_TEXT_NUMBER`; Email opens a prefilled email to `NEXT_PUBLIC_EMAIL_ADDRESS`.

When Twilio environment variables are present, `/api/chat-lead` can also send an SMS alert from the Twilio number to the owner number. Prefer `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET` over the main Auth Token. Keep all Twilio secrets out of Git and rotate them if they are ever pasted into chat.

Set the Twilio number inbound messaging webhook to:

```text
https://modhauschat.netlify.app/api/twilio/sms?secret=TWILIO_WEBHOOK_SECRET
```

Use `POST`. Inbound texts are captured as Netlify form leads and receive the same short thank-you reply.

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

## Storage Smoke Test

Run this after applying `supabase/schema.sql`:

```bash
npm run smoke:storage
```

If it reports that `product-images` is missing, create the public Supabase Storage bucket by rerunning `supabase/schema.sql` in the Supabase SQL editor.
