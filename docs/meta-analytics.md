# Meta Ads analytics + attribution

Layer that answers which campaign/ad produced each lead or student, and reconstructs the funnel from landing to matrícula.

## Architecture

- **Browser:** Meta Pixel via `src/lib/analytics/meta/client.ts`. Components never call `window.fbq` directly.
- **Server:** Conversions API via `sendMetaEvent()` in `src/lib/analytics/meta/server.ts`. Access token never ships to the client.
- **Dedup:** the same `event_id` is used on Pixel and CAPI (`crypto.randomUUID()`, or `invoice:{id}` for Purchase).
- **Persistence:** `marketing_attribution` (first/last UTM), `marketing_events` (funnel), `marketing_spend` (manual spend).
- **Purchase source of truth:** Wompi webhook (`/api/payments/webhook`) after signature verification, or admin mark-paid. **Never** `/checkout/confirmacion` refresh.

```
Pixel (browser)  ──event_id──►  CAPI (Graph API)
        │                         │
        └── marketing_events / marketing_attribution
```

`action_source` is always `website`.

## Environment variables

| Variable | Where | Required |
|---|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Browser + CAPI path | Yes to enable Pixel |
| `META_CONVERSIONS_API_ACCESS_TOKEN` | Server only | Yes to enable CAPI |
| `META_TEST_EVENT_CODE` | Server only | Optional (Events Manager test) |
| `META_API_VERSION` | Server only | Optional, default `v21.0` |

If Pixel ID or token is missing, helpers no-op. Missing CAPI never fails a lead or payment.

## Events

| Event | Pixel | CAPI | When | Value |
|---|---|---|---|---|
| PageView | yes | no | every page | — |
| ViewContent | yes | yes | program landing `/programas-academicos/[slug]` | list price (`discount` or `default_price`), COP |
| Lead | yes | yes | completed apartar-cupo or diagnóstico form | no value |
| Schedule | yes | yes | diagnóstico form saved | — |
| DiagnosticCompleted | no | yes | admin marks diagnóstico happened | — |
| CompleteRegistration | yes | yes | account created (`/registro` or checkout quick signup) | — |
| InitiateCheckout | yes | yes | `/checkout` loaded with a program, once per session | reservation 100.000 or list price |
| Purchase | **no** | yes | invoice newly `paid` | **charged invoice amount** (apartado 100.000, later cuota = that cuota) |

`ViewContent` custom data: `content_name`, `content_ids` (program `code`), `content_type=product`, `content_category`, `currency=COP`.

Purchase custom data: `currency=COP`, `value` = `invoices.amount`, `content_name`, `content_ids`, `order_id` = Wompi transaction id when present. Extra installment = another Purchase with a different `invoice:{id}`. Rejected payment = no Purchase.

## What we send to Meta

Matching / conversion only:

- hashed SHA-256: email, phone (digits, Colombia `57` prefix when 10 digits), `external_id`
- unhashed: `client_ip_address`, `client_user_agent`, `fbp`, `fbc`
- custom: content ids/name/type/category, currency, value, order_id

**Never sent:** lead message, WhatsApp body, academic notes, grades, attendance, consent checkbox text, honeypot, internal admin notes.

## Attribution

Cookie `tc_attr` + `localStorage` (`tc_attr`) + session `tc_sid`.

- **First-touch** (`first_*`) is written once and never overwritten.
- **Last-touch** updates when a new session has UTM or `fbclid`.
- Fields: `utm_source/medium/campaign/content/term`, `fbclid`, `landing_page`, `referrer`, `_fbp`/`_fbc`, `first_touch_at` / `last_touch_at`.
- Attached to `leads` on form submit, then to `profiles.user_id` on signup/payment.

## Funnels

1. Meta Ad → landing/programa → Lead → diagnóstico agendado → diagnóstico completado → checkout → reserva/pago → matrícula
2. Direct: Meta Ad → programa → checkout → pago

`leads.stage` stays as intent. Funnel steps are `marketing_events` + invoice/enrollment status.

Schedule = diagnóstico form saved (there is no Google Calendar webhook). DiagnosticCompleted is a staff action on the student/lead view.

## Payments

Webhook flow: validate Wompi checksum → mark matching invoice `paid` (any installment) → confirm enrollment only if `payment_number === 1` → `marketing_events` Purchase → CAPI.

Previously the webhook skipped later cuotas. It now marks them paid so installment Purchases can fire. Enrollment confirmation is still first installment only.

CAPI failure is logged (`[meta]`) without tokens or PII in production and does not fail the webhook.

## Admin

`/admin/marketing` (same sidenav/cards/tables as the rest of admin):

- Cards: spend, leads, diagnostics scheduled/completed, reservations, enrollments, attributed revenue, CPL, CAC, ROAS
- Funnel counts + conversion rates
- Campaigns table (campaign, ad/`utm_content`, program, leads, diagnostics, reservations, enrollments, revenue, spend, CPL, CAC, ROAS)
- Filters: date, campaign, route, program, audience
- Programs table: the route modules plus Ejecutivo when present. Capacity from offering `cohorts.capacity` (default 12). Shows e.g. `8/12`, occupancy %, remaining seats, CAC
- Student/lead view: **Origen / Marketing**
- Manual spend form (P2). Meta Ads Insights API is **not** implemented; future path would pull Insights into `marketing_spend`.

Formulas: `CPL = spend / leads`, `CAC = spend / enrolled`, `ROAS = attributed_revenue / spend`. Division by zero → `—`.

## Testing checklist

Use Events Manager → Test Events with `META_TEST_EVENT_CODE` set.

1. **ViewContent** — open `/programas-academicos/{slug}` with UTMs. Pixel + CAPI, same `event_id`. Value in COP.
2. **Lead** — submit apartar-cupo. Not on form open. Refreshing the success state does not resubmit.
3. **Schedule** — submit `/agendar-diagnostico`. Lead + Schedule both fire.
4. **DiagnosticCompleted** — admin → estudiante/lead → “Marcar diagnóstico completado”.
5. **InitiateCheckout** — open `/checkout?cohortId=…` once; reload should not duplicate in the same tab (`sessionStorage`).
6. **Purchase** — pay in Wompi test. Value = charged amount (100.000 for apartado). Rejected card = no Purchase. Reload `/checkout/confirmacion` = no extra Purchase.
7. **Installment** — pay a later invoice; second Purchase, different `event_id` / `order_id`.
8. **UTM first/last** — land with `utm_campaign=a`, later with `utm_campaign=b`. `first_*` stays `a`, `last_*` becomes `b`.
9. Dedup: Events Manager shows 1 event for Pixel+CAPI sharing `event_id`.

## Events Manager setup (Anuar)

1. Meta Events Manager → create or select Pixel → copy Pixel ID → Vercel `NEXT_PUBLIC_META_PIXEL_ID`.
2. Generate Conversions API access token → `META_CONVERSIONS_API_ACCESS_TOKEN` (server env only).
3. Verify domain `www.techcentre.co`.
4. Optional: Test Events → copy test code → `META_TEST_EVENT_CODE`. Remove it after QA.
5. Confirm events: ViewContent, Lead, Schedule, InitiateCheckout, Purchase, CompleteRegistration, DiagnosticCompleted.
6. Map custom events Schedule / DiagnosticCompleted if they appear under Custom.

## Changelog

- Added Pixel + CAPI helpers (`src/lib/analytics/meta/*`).
- Global PageView Pixel in root layout; ViewContent on program landings.
- Lead/Schedule on public forms; CompleteRegistration on signup; InitiateCheckout on checkout; Purchase only after Wompi/admin paid.
- First/last UTM attribution tables + cookie/localStorage.
- Webhook marks later cuotas paid and records Purchase without failing payment if CAPI fails.
- `/admin/marketing` dashboard, spend form, Origen / Marketing on student and lead views.
- Diagnostic completed timestamp on `leads`.

## Risks / pendings

- Apply `supabase/migrations/20260912000001_marketing_analytics.sql` on the project before using the dashboard.
- `leads` DDL is not in-repo; migration only `ALTER`s it.
- Diagnóstico “scheduled” is form submit, not calendar confirmation.
- `/contacto` and `/inscripcion` still open WhatsApp only — not leads, not Meta events.
- GA measurement ID remains hardcoded (pre-existing). Pixel uses env.
- Occupancy uses offering cohort capacity; Ejecutivo uses configured capacity when a cohort exists.
- Meta Ads API spend pull is documented only, not built.
- First paid invoice currently also confirms `enrollments.status = enrolled`, so reservations ≈ matrículas on the reservation checkout path.
