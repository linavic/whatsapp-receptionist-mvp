# QA Checklist

Use this before every customer go-live.

## GREEN API

- Instance is separate for this customer.
- WhatsApp QR is paired.
- Incoming message webhook reaches Make.
- Button reply payload reaches Make.
- GREEN API can send a normal text message.
- GREEN API can send interactive buttons.
- GREEN API can send interactive button replies.

## Make

- Scenario is named clearly.
- Webhook URL is pasted into the correct GREEN API instance.
- Router handles normal incoming messages.
- Router handles button payloads.
- Unknown payloads go to human fallback.
- Errors notify the owner/operator.

## Booking

- New lead creates/updates contact.
- Service selection works.
- Appointment request is stored.
- Appointment confirmation works.
- Reminder is scheduled.
- Cancellation changes appointment status.
- Waitlist offer is sent after cancellation.
- First reservation wins.
- Late reservation receives fallback message.

## Customer Experience

- Messages use the customer's tone.
- Buttons are short and clear.
- No important action depends on free-text interpretation.
- Human handoff is visible.
- Business owner approved all scripts.

## Reporting

- Lead count is tracked.
- Appointment count is tracked.
- Cancellation count is tracked.
- Review request count is tracked.
- Manual intervention count is tracked.

