# Flash Model Website Integration

## Goal

When a visitor fills the lead form on `flashmodel.as-biz.com`, the backend sends an automatic WhatsApp conversation that qualifies the lead and guides them to request an intro call with a human representative.

## Endpoint

```text
POST https://whatsapp-receptionist-mvp.onrender.com/webhook/site-lead
```

## Required Fields

```json
{
  "name": "שם הלקוח",
  "phone": "0500000000",
  "source": "flashmodel.as-biz.com"
}
```

Optional fields:

```json
{
  "email": "client@example.com",
  "message": "טקסט חופשי מהטופס",
  "page": "landing",
  "campaign": "facebook"
}
```

## Website JavaScript Snippet

Attach this to the lead form submit handler after the existing form validation:

```html
<script>
async function sendFlashModelLead(form) {
  const formData = new FormData(form);

  const payload = {
    name: formData.get("name") || formData.get("fullName") || "",
    phone: formData.get("phone") || formData.get("mobile") || "",
    email: formData.get("email") || "",
    message: formData.get("message") || "",
    source: "flashmodel.as-biz.com",
    page: window.location.href
  };

  const response = await fetch("https://whatsapp-receptionist-mvp.onrender.com/webhook/site-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.warn("Flash Model WhatsApp lead flow failed", await response.text());
  }
}
</script>
```

If the form already has a submit listener:

```js
document.querySelector("form").addEventListener("submit", async function (event) {
  await sendFlashModelLead(event.currentTarget);
});
```

## WhatsApp Flow

1. Customer submits website form.
2. Backend saves the customer and lead.
3. WhatsApp message is sent:

```text
שלום {name}, קיבלנו את הפרטים שלך באתר Flash Model...
```

4. Customer answers:

- להבין איך זה עובד
- מחיר וזמני הקמה
- התאמה לעסק שלי

5. Customer answers goal:

- יותר פניות מלקוחות
- דמו/נראות מקצועית
- ייעוץ לפני החלטה

6. Customer requests intro call:

- היום
- מחר
- שלחו לי הודעה קודם

7. Owner receives a human-call alert with the customer answers.

