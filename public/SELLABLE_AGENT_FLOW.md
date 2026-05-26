# Sellable Agent Flow

This document is the developer handoff for building a reusable "sellable agent" system.

Goal:

- user picks an industry like plumber, lawyer, doctor, builder, salon
- user fills business information
- system saves business info, context, and prompt in tables
- system creates a LiveAvatar-ready agent configuration
- system generates a shareable demo link
- every new business can get its own trained agent without manual setup

## 1. Product Flow

### Step 1: User creates a business agent

Capture:

- business name
- industry
- website
- service area
- phone
- email
- opening hours
- services offered
- FAQs
- pricing notes
- call to action
- preferred avatar
- preferred voice

### Step 2: System generates agent knowledge

System creates:

- business context
- sales context
- final prompt/persona
- selected LiveAvatar context ID
- selected avatar ID
- selected voice ID

### Step 3: System saves everything

Save to database:

- business profile
- knowledge/context
- prompt version
- public demo link
- internal slug

### Step 4: System creates a shareable link

Examples:

- `/agent/plumber/acme-plumbing`
- `/agent/lawyer/smith-legal`
- `/agent/medical/city-clinic`

When that page opens:

- it loads the correct business config
- it starts the avatar session with that business context
- it behaves as both demo agent and sales agent

## 2. Core Idea

Each agent should have 2 layers:

### A. Industry layer

Teaches the avatar how to speak for:

- plumber
- lawyer
- doctor
- builder
- salon

This controls:

- tone
- common questions
- industry language
- typical lead capture fields

### B. Business layer

Teaches the avatar about that specific company:

- business name
- actual services
- service area
- offers
- FAQ answers
- booking instructions
- phone/email/CTA

### C. Sales layer

Teaches the avatar to sell Speaking Sites and also sell the business itself:

- what the product does
- why it matters
- common objections
- when to ask for lead details
- how to guide toward booking/demo/contact

## 3. Recommended Tables

## `business_profiles`

One row per business/client.

| column | type | notes |
|---|---|---|
| id | uuid | primary key |
| slug | text unique | used in public link |
| business_name | text | display name |
| industry | text | plumber, lawyer, doctor, etc |
| website_url | text | optional |
| phone | text | business contact |
| email | text | business contact |
| service_area | text | city/region |
| opening_hours | jsonb | optional structured hours |
| cta_text | text | primary CTA |
| avatar_id | text | LiveAvatar avatar id |
| voice_id | text | LiveAvatar voice id |
| context_id | text | LiveAvatar context id |
| status | text | draft, active, paused |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## `business_knowledge`

Stores raw business information for training.

| column | type | notes |
|---|---|---|
| id | uuid | primary key |
| business_id | uuid | fk -> business_profiles.id |
| source_type | text | form, url, faq, manual, pdf |
| title | text | optional |
| content | text | raw knowledge |
| metadata | jsonb | source URL, tags, etc |
| created_at | timestamptz | |

## `agent_context_versions`

Stores generated context/prompt versions.

| column | type | notes |
|---|---|---|
| id | uuid | primary key |
| business_id | uuid | fk -> business_profiles.id |
| version_no | integer | 1, 2, 3... |
| industry_context | text | niche-specific instructions |
| business_context | text | business-specific info |
| sales_context | text | Speaking Sites + conversion logic |
| final_prompt | text | merged prompt sent to avatar system |
| is_active | boolean | active version |
| created_at | timestamptz | |

## `agent_links`

Stores generated links and link settings.

| column | type | notes |
|---|---|---|
| id | uuid | primary key |
| business_id | uuid | fk -> business_profiles.id |
| public_slug | text unique | final route slug |
| public_url | text | full deployed URL |
| embed_mode | text | iframe, full, livekit |
| is_active | boolean | current live link |
| created_at | timestamptz | |

## `lead_conversations`

Stores demo and production conversations.

| column | type | notes |
|---|---|---|
| id | uuid | primary key |
| business_id | uuid | fk -> business_profiles.id |
| session_id | text | LiveAvatar session id |
| lead_name | text | nullable |
| lead_phone | text | nullable |
| lead_email | text | nullable |
| summary | text | nullable |
| transcript_json | jsonb | array of turns |
| status | text | open, contacted, closed |
| created_at | timestamptz | |

## 4. Suggested Prompt Structure

Every agent prompt should be built from this structure:

### `industry_context`

Example:

```text
You are speaking as a helpful front-desk assistant for a plumbing business.
You understand plumbing emergencies, blocked drains, leaks, boiler issues,
appointments, service areas, and customer lead capture.
Use simple, practical language.
```

### `business_context`

Example:

```text
Business name: Acme Plumbing
Service area: Birmingham and nearby areas
Services: emergency plumbing, leak repair, blocked drains, boiler support
Phone: 01234 567890
Email: help@acmeplumbing.co.uk
CTA: Offer to collect name, phone, and issue summary for callback
```

### `sales_context`

Example:

```text
You are also demonstrating how Speaking Sites works.
Explain that the avatar helps businesses answer missed enquiries, qualify leads,
capture details, and respond 24/7.
When appropriate, explain the business benefit naturally.
Do not sound too pushy.
```

### `final_prompt`

Merged final prompt:

```text
Combine industry knowledge, business details, and sales behavior.
Answer clearly and naturally.
If the visitor asks about the business, answer using the business context.
If the visitor asks what this system does, explain the Speaking Sites value.
If the visitor shows intent, ask for name, phone number, email, and a short issue summary.
Never invent unavailable services or pricing.
```

## 5. API Flow

## A. Create business profile

`POST /api/businesses`

Request:

```json
{
  "businessName": "Acme Plumbing",
  "industry": "plumber",
  "websiteUrl": "https://example.com",
  "phone": "01234 567890",
  "email": "help@example.com",
  "serviceArea": "Birmingham",
  "services": [
    "Emergency plumbing",
    "Blocked drains",
    "Leak repairs"
  ],
  "faqs": [
    "Do you offer same-day service?",
    "What areas do you cover?"
  ],
  "ctaText": "Leave your details and we will call you back"
}
```

Response:

```json
{
  "businessId": "uuid",
  "slug": "acme-plumbing"
}
```

## B. Generate context + prompt

`POST /api/businesses/:businessId/generate-agent`

Server should:

1. load business profile
2. load industry base template
3. merge business data into business context
4. add shared sales context
5. save a new row in `agent_context_versions`
6. create or update LiveAvatar context
7. save returned `context_id` in `business_profiles`

Response:

```json
{
  "businessId": "uuid",
  "contextVersionId": "uuid",
  "contextId": "liveavatar_context_id",
  "status": "ready"
}
```

## C. Create link

`POST /api/businesses/:businessId/publish`

Server should:

1. ensure business has active context
2. create public slug
3. save row in `agent_links`
4. return final public URL

Response:

```json
{
  "url": "https://yourdomain.com/agent/plumber/acme-plumbing"
}
```

## D. Load agent by slug

`GET /api/agent/:slug`

Response:

```json
{
  "businessName": "Acme Plumbing",
  "industry": "plumber",
  "avatarId": "avatar_123",
  "voiceId": "voice_123",
  "contextId": "context_123",
  "ctaText": "Leave your details and we will call you back"
}
```

Frontend then calls the session route using those values.

## 6. Button Click Industry Switch

If the site has one demo page with multiple industries:

1. user clicks plumber / lawyer / doctor
2. frontend updates selected industry
3. frontend stops current session
4. frontend requests new session config
5. backend returns correct `context_id`, `avatar_id`, `voice_id`
6. frontend reconnects with new session

Example:

```ts
async function switchIndustry(industry: string) {
  await disconnectAvatar();

  const res = await fetch("/api/liveavatar/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ industry, slug: "acme-plumbing" })
  });

  const session = await res.json();
  await connectToAvatar(session);
}
```

## 7. Suggested Business Setup UI

Simple internal admin form:

### Section 1: Business Info

- business name
- industry
- phone
- email
- website
- service area

### Section 2: Services + FAQs

- services list
- top questions
- booking rules
- pricing notes

### Section 3: Agent Settings

- avatar
- voice
- tone
- CTA text

### Section 4: Publish

- generate context
- preview agent
- publish link
- copy link

## 8. Minimum MVP Logic

For MVP, keep it simple:

- do not build full RAG first
- use structured business info + prompt templates
- one industry template per niche
- one business context per client
- one public link per client

This is enough to create demo-ready sellable agents quickly.

Later, add:

- website crawling
- PDF upload
- FAQ import
- transcript learning
- CRM integration

## 9. Best Build Order

1. create tables
2. create business setup form
3. create industry templates
4. generate merged prompt/context
5. save active context version
6. create public slug page
7. wire LiveAvatar session route to business config
8. save leads + transcript
9. add preview/publish flow

## 10. Final Developer Instruction

Build this as a reusable agent generator, not a one-off demo.

The goal is:

- one admin can add a business
- system generates the correct agent config
- system stores business info, context, and prompt in tables
- system creates a public demo link
- each link acts as a sellable agent for that business

This should support both:

- one demo page with industry switching
- unique business pages with their own dedicated agent
