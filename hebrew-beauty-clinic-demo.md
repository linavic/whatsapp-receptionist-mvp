# דמו WhatsApp - קליניקת יופי

## מטרת הדמו

להראות לבעלת קליניקה איך "מזכירה דיגיטלית" עונה ללקוחות בוואטסאפ, מכוונת אותם עם כפתורים, מקבלת בקשות לתור, שולחת תזכורות, מטפלת בביטולים ומבקשת ביקורת.

## הודעה ראשונה

שלום, הגעת ל-{business_name}. איך אפשר לעזור?

כפתורים:

- קביעת תור -> `start_booking`
- טיפולים ומחירים -> `show_services`
- נציג אנושי -> `human_help`

## בחירת טיפול

בשמחה. לאיזה טיפול תרצי לקבוע?

כפתורים:

- טיפול פנים -> `service_select:facial`
- פדיקור רפואי -> `service_select:pedicure`
- ייעוץ ראשוני -> `service_select:consultation`

## אחרי בחירת טיפול

מעולה, קיבלנו את הבקשה שלך עבור {service_name}.  
נבדוק את הזמנים הקרובים ונחזור אלייך עם אפשרות לתור.

כפתורים:

- לדבר עם נציג -> `human_help`

התראה לבעלת העסק:

בקשת תור חדשה:

- לקוחה: {customer_name}
- טלפון: {customer_phone}
- טיפול: {service_name}
- שעה מועדפת: {preferred_time}

## הצעת שעה פנויה

מצאנו תור פנוי:

{date} בשעה {time}

כפתורים:

- שמרי לי את התור -> `slot_reserve:{slot_id}`
- הציגי שעה אחרת -> `slot_decline:{slot_id}`

## אישור תור

התור שלך אושר:

{service_name}  
{date} בשעה {time}

כפתורים:

- אני מגיעה -> `appointment_confirm:{appointment_id}`
- שינוי מועד -> `appointment_reschedule:{appointment_id}`
- ביטול תור -> `appointment_cancel:{appointment_id}`

## תזכורת לפני תור

תזכורת נעימה לתור שלך מחר:

{service_name}  
{date} בשעה {time}

כפתורים:

- אני מגיעה -> `appointment_confirm:{appointment_id}`
- צריכה לשנות -> `appointment_reschedule:{appointment_id}`
- ביטול תור -> `appointment_cancel:{appointment_id}`

## ביטול תור

התור בוטל. נוכל לעזור לך לקבוע מועד חדש?

כפתורים:

- קביעת תור חדש -> `start_booking`
- נציג אנושי -> `human_help`

## רשימת המתנה

התפנה תור עבור {service_name}:

{date} בשעה {time}

כפתורים:

- אני רוצה את התור -> `slot_reserve:{slot_id}`
- לא מתאים לי -> `slot_decline:{slot_id}`

## תגובה מאוחרת לרשימת המתנה

התור הזה כבר נתפס, אבל נשמח למצוא לך מועד אחר.

כפתורים:

- הציגי תורים נוספים -> `start_booking`
- נציג אנושי -> `human_help`

## אחרי טיפול

תודה שהגעת ל-{business_name}. נשמח לדעת איך הייתה החוויה שלך.

כפתורים:

- השארת ביקורת -> `open_review:{customer_id}`
- קביעת תור נוסף -> `start_booking`

## פולואפ לליד שלא סגר

היי, רק בודקים אם עדיין תרצי שנעזור לך לקבוע {service_name}.

כפתורים:

- כן, אשמח לקבוע -> `start_booking`
- לא כרגע -> `lead_followup_no:{lead_id}`

## כללי מוצר לדמו

- כל פעולה חשובה מתבצעת בכפתור.
- לא מבטלים או קובעים תור לפי טקסט חופשי בלבד.
- בכל מצב לא ברור עוברים לנציג אנושי.
- כל payload כולל פעולה ברורה ומזהה.

