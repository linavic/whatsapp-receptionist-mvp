# Live Connection Checklist

## What I Need From GREEN API

Create or choose a dedicated instance for this product demo.

Send/provide:

- `GREEN_ID_INSTANCE`
- `GREEN_API_TOKEN_INSTANCE`
- Confirmation that the WhatsApp QR is paired
- The instance webhook settings screen or webhook URL field access

Important:

Do not use an instance that already powers another live automation unless it is dedicated to this product.

## What I Need From Make

Create a new scenario:

`WhatsApp Receptionist - Demo Beauty Clinic`

First module:

- GREEN-API for WhatsApp: Watch Incoming Webhooks

Or use a custom webhook and paste its URL into GREEN API.

Send/provide:

- Make webhook URL
- Scenario edit access
- Confirmation the scenario is ON

## Local Backend Settings

Create `.env` from `.env.example`:

```env
PORT=8787
CUSTOMER_CONFIG_PATH=hebrew-beauty-clinic-config.json
GREEN_API_BASE_URL=https://api.green-api.com
GREEN_ID_INSTANCE=YOUR_INSTANCE_ID
GREEN_API_TOKEN_INSTANCE=YOUR_TOKEN
OWNER_ALERT_CHAT_ID=972500000000@c.us
```

## Public Webhook

GREEN API and Make need a public URL.

Recommended options:

- Deploy this backend to Render.
- Use a temporary tunnel for testing.
- Use Make as the public webhook and forward to this backend.

Webhook endpoint:

`POST /webhook/green-api`

Health check:

`GET /health`

Demo start:

`GET /demo/start`

Admin local DB:

`GET /admin/db`

## First Live Test

1. Pair WhatsApp in GREEN API.
2. Put the public webhook URL in the instance.
3. Send a WhatsApp message to the connected number.
4. Confirm the first reply arrives with 3 buttons.
5. Click `קביעת תור`.
6. Confirm service buttons arrive.
7. Click `טיפול פנים`.
8. Confirm lead and appointment request are stored.
9. Confirm owner alert arrives.
10. Test cancel/confirm payload.

## Go-Live Rule

The product is not live until these pass:

- Incoming message received
- Button reply received
- Button response sent
- Lead stored
- Appointment request stored
- Owner alert sent
- Human fallback works

