export function createFirstReply(config) {
  return {
    text: `שלום, הגעת ל-${config.business.name}. איך אפשר לעזור?`,
    buttons: [
      { text: "קביעת תור", payload: config.payloads.startBooking },
      { text: "טיפולים ומחירים", payload: config.payloads.showServices },
      { text: "נציג אנושי", payload: config.payloads.humanHelp }
    ]
  };
}

export function createServiceReply(config) {
  return {
    text: "בשמחה. לאיזה טיפול תרצי לקבוע?",
    buttons: config.services
      .filter((service) => service.active)
      .slice(0, 3)
      .map((service) => ({
        text: service.name,
        payload: `service_select:${service.id}`
      }))
  };
}

export function createOwnerAlertText({ customer, serviceName, appointment }) {
  return [
    "תור חדש נקבע:",
    "",
    `לקוחה: ${customer.name || customer.phone}`,
    `טלפון: ${customer.phone}`,
    `טיפול: ${serviceName}`,
    `מועד: ${formatAppointmentTime(appointment.startsAt)}`,
    `מספר תור: ${appointment.id}`
  ].join("\n");
}

const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function createSlotOptions(config, serviceId) {
  const preferredTimes = [
    { hour: 10, minute: 0 },
    { hour: 12, minute: 0 },
    { hour: 16, minute: 30 }
  ];
  const slots = [];

  for (let offset = 1; offset <= 14 && slots.length < 3; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const ranges = config.workingHours?.[dayKeys[date.getDay()]] ?? [];
    if (ranges.length === 0) continue;

    for (const time of preferredTimes) {
      if (!isTimeInsideRanges(time, ranges)) continue;
      date.setHours(time.hour, time.minute, 0, 0);
      const token = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
        String(time.hour).padStart(2, "0"),
        String(time.minute).padStart(2, "0")
      ].join("");

      const startsAt = `${token.slice(0, 4)}-${token.slice(4, 6)}-${token.slice(6, 8)}T${token.slice(8, 10)}:${token.slice(10, 12)}:00+03:00`;
      slots.push({
        token,
        startsAt,
        label: formatAppointmentTime(startsAt),
        payload: `slot_reserve:${serviceId}:${token}`
      });
      if (slots.length >= 3) break;
    }
  }

  return slots;
}

function isTimeInsideRanges(time, ranges) {
  const minutes = time.hour * 60 + time.minute;
  return ranges.some((range) => {
    const [start, end] = range.split("-");
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    return minutes >= startHour * 60 + startMinute && minutes < endHour * 60 + endMinute;
  });
}

export function parseSlotPayload(payload) {
  const [, serviceId, token] = payload.split(":");
  if (!serviceId || !token || token.length !== 12) return null;
  return {
    serviceId,
    token,
    startsAt: `${token.slice(0, 4)}-${token.slice(4, 6)}-${token.slice(6, 8)}T${token.slice(8, 10)}:${token.slice(10, 12)}:00+03:00`
  };
}

export function formatAppointmentTime(value) {
  if (!value) return "טרם נקבע";
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function handlePayload(config, payload) {
  if (!payload) return createFirstReply(config);

  if (payload === config.payloads.startBooking || payload === config.payloads.showServices) {
    return createServiceReply(config);
  }

  if (payload === config.payloads.humanHelp) {
    return {
      text: "נציג אנושי יחזור אלייך בהקדם. כבר עדכנו את בעלת העסק.",
      buttons: []
    };
  }

  if (payload.startsWith("service_select:")) {
    const serviceId = payload.split(":")[1];
    const service = config.services.find((item) => item.id === serviceId);
    const slots = createSlotOptions(config, serviceId);
    return {
      text: `מעולה. אלו התורים הפנויים הקרובים עבור ${service?.name ?? "הטיפול"}:`,
      ownerAlert: {
        type: "service_selected",
        serviceId,
        serviceName: service?.name ?? serviceId
      },
      buttons: slots.map((slot) => ({ text: slot.label, payload: slot.payload }))
    };
  }

  if (payload.startsWith("appointment_confirm:")) {
    return {
      text: "מעולה, האישור שלך התקבל. נתראה בתור.",
      buttons: []
    };
  }

  if (payload.startsWith("appointment_cancel:")) {
    return {
      text: "התור בוטל. נוכל לעזור לך לקבוע מועד חדש?",
      buttons: [
        { text: "קביעת תור חדש", payload: config.payloads.startBooking },
        { text: "נציג אנושי", payload: config.payloads.humanHelp }
      ]
    };
  }

  if (payload.startsWith("slot_reserve:")) {
    const slot = parseSlotPayload(payload);
    const service = config.services.find((item) => item.id === slot?.serviceId);
    return {
      text: `התור נקבע ואושר ✅\n\nטיפול: ${service?.name ?? "הטיפול"}\nמועד: ${formatAppointmentTime(slot?.startsAt)}\n\nנשלחה התראה לבעלת העסק.`,
      buttons: [
        { text: "ביטול תור", payload: `appointment_cancel:latest` },
        { text: "נציג אנושי", payload: config.payloads.humanHelp }
      ],
      appointment: {
        serviceId: slot?.serviceId,
        serviceName: service?.name ?? slot?.serviceId,
        startsAt: slot?.startsAt
      }
    };
  }

  return {
    text: "לא הצלחנו להבין את הפעולה. נציג אנושי יבדוק את זה.",
    buttons: [
      { text: "להתחיל מחדש", payload: config.payloads.startBooking },
      { text: "נציג אנושי", payload: config.payloads.humanHelp }
    ]
  };
}
