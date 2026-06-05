# Make Scenario Build Guide

## Scenario Name

`WhatsApp Receptionist - Demo Beauty Clinic`

## Module 1 - Incoming Webhook

Use one of:

- GREEN-API for WhatsApp: Watch Incoming Webhooks
- Custom Webhook

Output must include:

- Chat ID
- Sender name
- Message body
- Button payload / selected button id

## Module 2 - HTTP Call To Backend

Method:

`POST`

URL:

`{PUBLIC_BACKEND_URL}/webhook/green-api`

Headers:

`Content-Type: application/json`

Body:

Pass the full GREEN API webhook payload.

## Module 3 - Optional Logger

Store response in:

- Google Sheets
- Airtable
- Make Data Store

Fields:

- timestamp
- chatId
- payload
- reply text
- sendResult status

## Module 4 - Error Handling

If backend call fails:

- Send owner alert
- Log payload
- Continue scenario without dropping the event

## Why This Structure

Make stays simple and visible. The product logic lives in the backend, so each customer can be adapted by changing the customer config instead of rebuilding the Make scenario.

