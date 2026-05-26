# SupplyBird Chatbot Infrastructure Blueprint

## Positioning

The chatbot is not the product. The product is the lead-response system around it:

```text
Simple contact capture -> faster reply -> cleaner follow-up -> more quote-ready opportunities
```

The current Chatway-style widget is useful as a visible chat/contact channel. For this prototype, the better move is to keep the consumer chatbot simple: phone number, email, message, and product context when available.

## Blueprint

```text
Traffic source
-> Chatway/custom website widget
-> simple message capture
-> lead database / CRM
-> notification + follow-up automation
-> dashboard / pipeline
-> human sales handoff
```

## SupplyBird Message Flow

Minimum message fields:

- phone number
- email
- message
- product context, if the message starts from a product card
- recommended next step

## V1 Case-Study Build

Use the current prototype:

```text
React + Tailwind
+ simple message assistant
+ consumer product calculator
+ Firebase/Google auth hook with demo owner mode
+ localStorage lead dashboard and editable product records
+ case-study explanation
```

This shows the core business proof: a shopper can calculate boxes, send a short message, and land in the seller dashboard.

## Owner Dashboard Requirements

The owner or seller needs more than lead viewing. They need a lightweight operating surface:

- sign in with Google
- review leads and change status
- edit product names, categories, pricing labels, stock state, stock quantity, box coverage, specs, and notes
- update listing images by hosted URL or image upload/storage
- see which products are low stock
- reset or sync records during pilot testing

The prototype keeps this in localStorage so the workflow can be tested immediately. A real pilot should move the same
shape into Airtable or Supabase rather than asking the owner to edit website code.

## V1.5 Practical Pilot With Airtable

Airtable is the fastest real stack when the client needs an operational pilot without a full backend.

Recommended Airtable tables:

- `Leads`
- `Products`
- `Follow Up Tasks`
- `Activity Log`

Suggested `Products` fields:

```text
Product ID
Name
Category
Project Type
Price
Price Label
Availability
Condition
Specs
Notes
Image Attachment / Image URL
Image Alt Text
Sq.ft. Per Box / Case
Stock Quantity
Stock Unit Label
Updated By
Updated At
```

The consumer calculator should read `Sq.ft. Per Box / Case` directly. For example, if an owner enters `20.1`, a shopper
who needs `875` square feet can be shown the exact number of boxes after rounding up and adding a waste factor.

Suggested `Leads` fields:

```text
Lead ID
Created At
Source
Status
Priority
Project Type
Product Interest
Estimated Quantity
Urgency
Pickup / Delivery
Location
Budget
Contact Name
Phone
Email
Notes
Recommended Next Step
Assigned To
Next Follow-Up Date
```

Flow:

```text
Website widget
-> serverless submit endpoint
-> Airtable Leads table
-> Make/Zapier/n8n notification
-> team follows up in Airtable or CRM
```

For images, Airtable attachments are fine for a pilot. If the dashboard becomes a real app, move images to Supabase
Storage, Firebase Storage, or Vercel Blob and store only the URL in the product record.

## Scalable Production Options

### Airtable-First

Best for fast client pilots and owner-operated workflows.

- Website widget posts to a serverless endpoint.
- Endpoint writes to Airtable.
- Airtable views act as the early dashboard.
- Make/Zapier/n8n handles email, SMS, and Slack notifications.
- Later, qualified leads can sync to HubSpot, GoHighLevel, or Close.

Tradeoff: Airtable is fast to operate but not ideal for complex auth, permissions, high write volume, or productized multi-client dashboards.

### Supabase-First

Best when the dashboard needs to become a real app.

- Postgres stores leads, products, events, and follow-up tasks.
- Row-level security and auth support an admin dashboard.
- Edge Functions can run lead scoring, notifications, and CRM sync.
- OpenAI FAQ/RAG can use Postgres/pgvector when needed.

Tradeoff: more engineering up front, but cleaner long-term application infrastructure.

### CRM-First

Best when the client already operates inside GoHighLevel, HubSpot, Close, or a similar CRM.

- Website widget captures the lead.
- Serverless endpoint validates and normalizes the payload.
- CRM contact/opportunity is created.
- CRM workflows handle follow-up and pipeline stages.
- Local dashboard can become read-only reporting if needed.

Tradeoff: fastest adoption for the sales team, but customization depends on the CRM.

## Recommended Next Step

Use this prototype to sell the workflow first. For a real SupplyBird pilot, build an Airtable-backed version before adding AI FAQ/RAG:

```text
Custom React widget
-> /api/leads submit endpoint
-> Airtable Leads table
-> internal notification
-> buyer confirmation
-> dashboard/status workflow
```

Then add OpenAI only where it helps:

- summarize messy notes
- classify priority
- identify missing fields
- answer bounded FAQs
- draft follow-up messages
