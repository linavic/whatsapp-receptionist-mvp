export function toGreenApiInteractiveButtons(chatId, reply) {
  return {
    chatId,
    body: reply.text,
    footer: "Powered by WhatsApp Receptionist",
    buttons: reply.buttons.map((button) => ({
      buttonId: button.payload,
      buttonText: button.text
    }))
  };
}

export async function sendGreenApiInteractiveButtons({ baseUrl, idInstance, apiTokenInstance, chatId, reply }) {
  if (!idInstance || !apiTokenInstance) {
    return {
      ok: false,
      skipped: true,
      reason: "GREEN API credentials are missing"
    };
  }

  if (reply.buttons.length === 0) {
    return sendGreenApiMessage({ baseUrl, idInstance, apiTokenInstance, chatId, message: reply.text });
  }

  try {
    const url = `${baseUrl}/waInstance${idInstance}/sendInteractiveButtonsReply/${apiTokenInstance}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toGreenApiInteractiveButtons(chatId, reply))
    });
    const body = await response.text();

    return {
      ok: response.ok,
      status: response.status,
      body
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

export async function sendGreenApiMessage({ baseUrl, idInstance, apiTokenInstance, chatId, message }) {
  try {
    const url = `${baseUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chatId, message })
    });
    const body = await response.text();

    return {
      ok: response.ok,
      status: response.status,
      body
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

export function extractIncomingPayload(body) {
  return (
    body?.messageData?.interactiveButtonsResponse?.selectedId ||
    body?.messageData?.buttonsResponseMessage?.selectedButtonId ||
    body?.messageData?.interactiveMessage?.buttonReply?.id ||
    body?.payload ||
    null
  );
}

export function shouldProcessWebhook(body) {
  if (body?.payload) return true;
  return body?.typeWebhook === "incomingMessageReceived";
}

export function extractChatId(body) {
  return body?.senderData?.chatId || body?.chatId || "demo-chat";
}

export function extractSenderPhone(body) {
  const chatId = extractChatId(body);
  return chatId.replace("@c.us", "");
}

export function extractSenderName(body) {
  return body?.senderData?.senderName || body?.senderName || "";
}
