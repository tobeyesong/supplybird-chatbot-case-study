# SupplyBird Chatbot Case Study Prototype

React + TypeScript + Tailwind prototype for a SupplyBird buyer-response and estimate-intake workflow.

## What It Validates

This prototype tests whether a narrow chatbot-style assistant can improve speed-to-lead for a local building-supplies store. The assistant is tied to catalog browsing and captures structured estimate details before staff follow up:

- project type and product interest
- square footage, linear footage, or quantity
- urgency and pickup or delivery preference
- location, budget, contact information, and notes
- a recommended next step for the seller dashboard

The point is practical lead qualification, not AI novelty.

## Prototype Surface

- Storefront/catalog home using SupplyBird-style categories and live-site business details
- Seeded inventory for flooring, decking, roofing, windows, appliances, and other supplies
- Search and filters for category, availability, price range, and project type
- Project Estimate Assistant drawer with a scripted qualification flow
- LocalStorage lead persistence
- Google-gated seller/admin dashboard with demo owner mode
- Lead status changes for `new`, `contacted`, `quoted`, `won`, and `lost`
- Editable product listings with image URL updates and local image previews
- Case-study section with problem, solution, workflow, and metrics placeholders
- Generated bitmap assets in `public/supplybird-assets`
- Production path in `docs/supplybird-infrastructure-blueprint.md`

## Design Notes

The UI adapts local Tailwind Plus ecommerce/application patterns for product cards, filters, drawers, forms, and lead lists. It also applies Refactoring UI principles from the Obsidian vault: start with the feature, establish hierarchy through weight and contrast, use constrained spacing/type choices, keep borders purposeful, and avoid oversized marketing composition.

## Production Path

The current SupplyBird site appears to use a Chatway-style live chat widget. That can remain the visible chat channel, but the stronger system is:

```text
chat/contact widget -> structured estimate intake -> Airtable/Supabase/CRM -> notification + follow-up -> dashboard
```

See [docs/supplybird-infrastructure-blueprint.md](docs/supplybird-infrastructure-blueprint.md) for the Airtable-first and Supabase-first paths.

## Owner Login

The dashboard follows the Firebase Google Sign-In pattern from the Video X project. To use real Google auth, create a
Firebase web app and add:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Without those env vars, use `Use demo owner mode` in the dashboard. The current owner allowlist is defined in
`src/App.tsx` as `allowedOwnerEmails`.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL, usually:

```text
http://localhost:5173/
```

## Verify The Main Flow

1. Browse the inventory grid.
2. Click `Ask / Get estimate` on a product card.
3. Complete the Project Estimate Assistant steps.
4. Save the lead.
5. Confirm the new lead appears in the dashboard.
6. Change the lead status and refresh to confirm LocalStorage persistence.
