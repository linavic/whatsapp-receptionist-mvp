# GREEN API + Make Flow

## Architecture

Customer WhatsApp number
-> GREEN API instance
-> Make webhook scenario
-> Router by message type and button payload
-> Storage layer
-> Calendar / CRM / payment / owner notification
-> GREEN API response

## Required GREEN API Setup

Each customer should have a separate GREEN API instance unless they already have a dedicated unused instance for this product.

Do not change an existing live webhook that is already used by another process.

Required checks:

- WhatsApp device is paired by QR.
- Incoming message webhook is enabled.
- Button reply webhook is enabled.
- API-sent message webhook is optional.
- Status updates are optional.
- State changes are enabled for connection monitoring.

## Core GREEN API Methods

Use interactive buttons for all important customer decisions.

Validated method for reply buttons:

- `sendInteractiveButtonsReply`

## Make Scenario Modules

Suggested scenario name:

`WhatsApp Receptionist - {Customer Name}`

Recommended modules:

- GREEN-API for WhatsApp: Watch Incoming Webhooks
- Router: identify event type
- Data store / Airtable / Google Sheets: find or create contact
- Router: payload action
- Google Calendar: check/create/update appointment
- HTTP or payment provider: create payment link when needed
- GREEN-API for WhatsApp: Send Interactive Buttons
- GREEN-API for WhatsApp: Send Interactive Buttons Reply
- Gmail or WhatsApp owner alert: notify business owner

## Main Customer Journey

### 1. New Lead

Trigger:

- Customer sends any first WhatsApp message.

Response:

Buttons:

- Book appointment
- Prices/services
- Talk to human

Payloads:

- `start_booking`
- `show_services`
- `human_help`

### 2. Service Selection

Response:

Buttons are based on configured services.

Payload:

- `service_select:{service_id}`

### 3. Appointment Request

The system offers available time slots or asks the owner to approve when automatic booking is disabled.

Payloads:

- `slot_reserve:{slot_id}`
- `slot_decline:{slot_id}`

### 4. Appointment Confirmation

After booking:

Buttons:

- Confirm
- Change
- Cancel

Payloads:

- `appointment_confirm:{appointment_id}`
- `appointment_reschedule:{appointment_id}`
- `appointment_cancel:{appointment_id}`

### 5. Reminder

Recommended timing:

- 24 hours before appointment
- 2 hours before appointment for high no-show niches

Reminder buttons:

- I am coming
- Need to change
- Cancel

### 6. Cancellation and Waitlist

When a customer cancels:

1. Mark appointment as cancelled.
2. Find waitlist customers for the same service.
3. Offer the slot to the first matching waitlist group.
4. First customer to click reserve wins.
5. Late responders get an alternative slot.

Payloads:

- `slot_reserve:{appointment_id}`
- `slot_decline:{appointment_id}`

## Data Model

### Customer

- id
- name
- phone
- tags
- first_seen_at
- last_seen_at
- source
- status

### Service

- id
- name
- duration_minutes
- price
- deposit_required
- active

### Appointment

- id
- customer_id
- service_id
- staff_id
- starts_at
- ends_at
- status
- source
- deposit_status

### Lead

- id
- customer_id
- service_interest
- status
- followup_step
- next_followup_at

### Waitlist Item

- id
- customer_id
- service_id
- preferred_time_window
- status
- created_at

## Safety Rules

- Never cancel, reschedule, or charge based only on free text.
- Critical actions require buttons.
- Owner gets notified for unclear cases.
- All payloads must include an entity id.
- Each customer must have isolated GREEN API and Make configuration.

