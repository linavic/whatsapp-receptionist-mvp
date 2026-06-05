# Go-Live Plan

## Target Result

A live WhatsApp number connected to GREEN API answers customers in Hebrew, shows appointment buttons, stores leads and appointment requests, and alerts the business owner.

## Step 1 - Public Backend

Deploy this repository to Render or another Node host.

Required env vars:

- `CUSTOMER_CONFIG_PATH`
- `GREEN_ID_INSTANCE`
- `GREEN_API_TOKEN_INSTANCE`
- `OWNER_ALERT_CHAT_ID`

After deploy, verify:

- `GET https://YOUR_DOMAIN/health`
- `GET https://YOUR_DOMAIN/demo/start`

## Step 2 - GREEN API

Use a dedicated instance.

Configure webhook URL:

`https://YOUR_DOMAIN/webhook/green-api`

Enable:

- Incoming messages
- Button reply messages
- State changes

Pair WhatsApp QR.

## Step 3 - Make

Use Make if we want visible workflow logging and later integrations.

Recommended first version:

GREEN API webhook -> Make scenario -> backend `/webhook/green-api`

Recommended scale version:

GREEN API webhook -> backend directly

Make handles optional CRM/calendar/payment side effects.

## Step 4 - Live Demo Test

Test from another WhatsApp number:

1. Send "שלום".
2. Confirm 3 buttons arrive.
3. Click "קביעת תור".
4. Confirm service buttons arrive.
5. Click "טיפול פנים".
6. Confirm appointment request is stored.
7. Confirm owner alert arrives.
8. Test "נציג אנושי".
9. Test cancellation payload.

## Step 5 - First Customer Pilot

Use a real business with a simple setup:

- 3 services
- one owner
- owner approval mode
- no payments in first week
- reminders after first live booking succeeds

Pilot success metric:

- At least one new lead captured
- At least one appointment request stored
- Owner confirms the experience feels useful

