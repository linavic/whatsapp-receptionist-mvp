import http from "node:http";
import { getEnv } from "./env.js";
import { loadCustomerConfig } from "./config.js";
import { createFirstReply, createOwnerAlertText, handlePayload } from "./flow.js";
import {
  extractChatId,
  extractIncomingPayload,
  extractSenderName,
  extractSenderPhone,
  sendGreenApiInteractiveButtons,
  shouldProcessWebhook,
  toGreenApiInteractiveButtons
} from "./green-api-adapter.js";
import {
  createAppointmentRequest,
  createLead,
  logEvent,
  updateAppointmentStatus,
  upsertCustomer
} from "./storage.js";

const port = Number(getEnv("PORT", "8787"));
const config = await loadCustomerConfig();
const greenApiSettings = {
  baseUrl: getEnv("GREEN_API_BASE_URL", "https://api.green-api.com"),
  idInstance: getEnv("GREEN_ID_INSTANCE"),
  apiTokenInstance: getEnv("GREEN_API_TOKEN_INSTANCE")
};
const ownerAlertChatId = getEnv("OWNER_ALERT_CHAT_ID");

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, {
        ok: true,
        product: "whatsapp-receptionist-mvp",
        version: "2026-06-05-webhook-filter"
      });
      return;
    }

    if (request.method === "GET" && request.url === "/demo/start") {
      sendJson(response, 200, createFirstReply(config));
      return;
    }

    if (request.method === "GET" && request.url === "/admin/db") {
      const { readDb } = await import("./storage.js");
      sendJson(response, 200, await readDb());
      return;
    }

    if (request.method === "POST" && request.url === "/webhook/green-api") {
      const body = await readJson(request);
      if (!shouldProcessWebhook(body)) {
        await logEvent("ignored_webhook", { typeWebhook: body?.typeWebhook ?? "unknown", body });
        sendJson(response, 200, { ok: true, ignored: true, typeWebhook: body?.typeWebhook ?? "unknown" });
        return;
      }

      const chatId = extractChatId(body);
      const payload = extractIncomingPayload(body);
      const customer = await upsertCustomer({
        chatId,
        phone: extractSenderPhone(body),
        name: extractSenderName(body)
      });

      const reply = handlePayload(config, payload);
      await logEvent("incoming_webhook", { chatId, payload, body });

      if (payload?.startsWith("service_select:")) {
        const serviceId = payload.split(":")[1];
        const service = config.services.find((item) => item.id === serviceId);
        const serviceName = service?.name ?? serviceId;
        await createLead({ customerId: customer.id, serviceId, serviceName });
        const appointment = await createAppointmentRequest({ customerId: customer.id, serviceId, serviceName });

        if (ownerAlertChatId) {
          await sendGreenApiInteractiveButtons({
            ...greenApiSettings,
            chatId: ownerAlertChatId,
            reply: {
              text: createOwnerAlertText({ customer, serviceName, appointment }),
              buttons: []
            }
          });
        }
      }

      if (payload?.startsWith("appointment_confirm:")) {
        await updateAppointmentStatus(payload.split(":")[1], "confirmed_by_customer");
      }

      if (payload?.startsWith("appointment_cancel:")) {
        await updateAppointmentStatus(payload.split(":")[1], "cancelled_by_customer");
      }

      const sendResult = await sendGreenApiInteractiveButtons({
        ...greenApiSettings,
        chatId,
        reply
      });

      sendJson(response, 200, {
        reply,
        sendResult,
        greenApiMethod: "sendInteractiveButtonsReply",
        greenApiPayload: toGreenApiInteractiveButtons(chatId, reply)
      });
      return;
    }

    sendJson(response, 404, { error: "not_found" });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`WhatsApp Receptionist MVP listening on http://localhost:${port}`);
});
