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
    "New appointment request:",
    "",
    `Customer: ${customer.name || customer.phone}`,
    `Phone: ${customer.phone}`,
    `Service: ${serviceName}`,
    `Appointment ID: ${appointment.id}`
  ].join("\n");
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
    return {
      text: `מעולה, קיבלנו את הבקשה שלך עבור ${service?.name ?? "הטיפול"}. נבדוק את הזמנים הקרובים ונחזור אלייך עם אפשרות לתור.`,
      ownerAlert: {
        type: "appointment_request",
        serviceId,
        serviceName: service?.name ?? serviceId
      },
      buttons: [
        { text: "נציג אנושי", payload: config.payloads.humanHelp }
      ]
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
    return {
      text: "התור נשמר עבורך. נשלח אישור סופי בהקדם.",
      buttons: []
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
