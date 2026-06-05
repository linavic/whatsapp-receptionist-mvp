# WhatsApp Receptionist MVP

Digital WhatsApp receptionist for small appointment-based businesses.

The product receives GREEN API webhooks, routes button payloads, stores customers/leads/appointment requests, and sends replies back through GREEN API when credentials are configured.

## Quick Start

```powershell
Copy-Item .env.example .env
npm.cmd run smoke
npm.cmd start
```

Health check:

```text
http://localhost:8787/health
```

Demo:

```text
http://localhost:8787/demo/start
```

## Required Environment

```env
PORT=8787
CUSTOMER_CONFIG_PATH=hebrew-beauty-clinic-config.json
GREEN_API_BASE_URL=https://api.green-api.com
GREEN_ID_INSTANCE=YOUR_INSTANCE_ID
GREEN_API_TOKEN_INSTANCE=YOUR_TOKEN
OWNER_ALERT_CHAT_ID=972500000000@c.us
```

## Webhook

GREEN API / Make should send incoming events to:

```text
POST /webhook/green-api
```

## Admin

Local database:

```text
GET /admin/db
```

Stored data is written to:

```text
data/db.json
```

## Product Files

- `product-blueprint.md` - business/product definition
- `green-api-make-flow.md` - technical flow
- `hebrew-beauty-clinic-demo.md` - Hebrew demo script
- `hebrew-beauty-clinic-config.json` - demo customer config
- `customer-onboarding-template.md` - customer setup form
- `message-templates.md` - reusable message templates
- `sales-playbook.md` - sales script and positioning
- `qa-checklist.md` - go-live test checklist
- `live-connection-checklist.md` - GREEN API and Make connection steps

## Current Status

Working:

- Hebrew first reply
- Service buttons
- Button payload routing
- Lead creation
- Appointment request creation
- Confirm/cancel status updates
- GREEN API payload formatting
- GREEN API live send path when credentials are present
- Smoke tests

Next live requirement:

- Add real GREEN API credentials
- Pair WhatsApp QR
- Set public webhook URL
- Turn on Make scenario if Make is used as the gateway

