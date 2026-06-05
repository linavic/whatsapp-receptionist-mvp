# Message Templates

Replace variables inside braces for each customer.

## First Reply

Hi, this is {business_name}. How can we help today?

Buttons:

- Book appointment -> `start_booking`
- Services/prices -> `show_services`
- Talk to human -> `human_help`

## Service Selection

Great. What service are you interested in?

Buttons:

- {service_1_name} -> `service_select:{service_1_id}`
- {service_2_name} -> `service_select:{service_2_id}`
- {service_3_name} -> `service_select:{service_3_id}`

## Owner Approval Booking

Thanks. We received your appointment request for {service_name}. The business will confirm the nearest available time shortly.

Owner alert:

New appointment request:

- Customer: {customer_name}
- Phone: {customer_phone}
- Service: {service_name}
- Preferred time: {preferred_time}

## Automatic Slot Offer

We have this time available:

{date} at {time}

Buttons:

- Reserve this time -> `slot_reserve:{slot_id}`
- Show another time -> `slot_decline:{slot_id}`

## Appointment Confirmed

Your appointment is confirmed:

{service_name}
{date} at {time}

Buttons:

- I am coming -> `appointment_confirm:{appointment_id}`
- Change time -> `appointment_reschedule:{appointment_id}`
- Cancel -> `appointment_cancel:{appointment_id}`

## Reminder

Reminder for your appointment tomorrow:

{service_name}
{date} at {time}

Buttons:

- I am coming -> `appointment_confirm:{appointment_id}`
- Change time -> `appointment_reschedule:{appointment_id}`
- Cancel -> `appointment_cancel:{appointment_id}`

## Cancellation

Your appointment was cancelled. If you want, we can help you book another time.

Buttons:

- Book another time -> `start_booking`
- Talk to human -> `human_help`

## Waitlist Slot Offer

A time opened up for {service_name}:

{date} at {time}

Buttons:

- Reserve this time -> `slot_reserve:{slot_id}`
- Not relevant -> `slot_decline:{slot_id}`

## Late Waitlist Response

This time is no longer available, but we can help you find another one.

Buttons:

- Show another time -> `start_booking`
- Talk to human -> `human_help`

## Post-Appointment

Thank you for visiting {business_name}. We would love to hear how it was.

Buttons:

- Leave a review -> `open_review:{customer_id}`
- Book next appointment -> `start_booking`

## Unclosed Lead Follow-Up

Hi, just checking if you still want help booking {service_name}.

Buttons:

- Yes, book me -> `start_booking`
- Not now -> `lead_followup_no:{lead_id}`

