import http from "node:http";
import { getEnv } from "./env.js";
import { loadCustomerConfig } from "./config.js";
import {
  createFirstReply,
  createLeadIntroReply,
  createLeadOwnerAlertText,
  createOwnerAlertText,
  handlePayload,
  parseIntroCallPayload,
  parseLeadAnswerPayload
} from "./flow.js";
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
  createLead,
  createSiteLead,
  findLatestLeadByCustomer,
  getLeadAnswers,
  logEvent,
  saveLeadAnswer,
  scheduleAppointment,
  updateLeadStatus,
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
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

function toChatId(phone) {
  const normalized = normalizePhone(phone);
  return normalized ? `${normalized}@c.us` : "";
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, {
        ok: true,
        product: "whatsapp-receptionist-mvp",
        version: "2026-06-05-flashmodel-lead-flow"
      });
      return;
    }

    if (request.method === "GET" && request.url === "/demo/start") {
      sendJson(response, 200, createFirstReply(config));
      return;
    }

    if (request.method === "POST" && request.url === "/webhook/site-lead") {
      const body = await readJson(request);
      const phone = normalizePhone(body.phone || body.mobile || body.whatsapp);
      const chatId = toChatId(phone);

      if (!chatId) {
        sendJson(response, 400, { ok: false, error: "phone is required" });
        return;
      }

      const customer = await upsertCustomer({
        chatId,
        phone,
        name: body.name || body.fullName || ""
      });
      const lead = await createSiteLead({
        customerId: customer.id,
        source: body.source || config.leadFlow?.sourceName || "website",
        form: body
      });
      await logEvent("site_lead_received", { customerId: customer.id, leadId: lead.id, body });

      const reply = createLeadIntroReply(config, { name: customer.name });
      const sendResult = await sendGreenApiInteractiveButtons({
        ...greenApiSettings,
        chatId,
        reply
      });

      if (ownerAlertChatId) {
        await sendGreenApiInteractiveButtons({
          ...greenApiSettings,
          chatId: ownerAlertChatId,
          reply: {
            text: `ליד חדש מהאתר Flash Model:\n\nשם: ${customer.name || "לא צוין"}\nטלפון: ${customer.phone}\nמקור: ${lead.source}`,
            buttons: []
          }
        });
      }

      sendJson(response, 200, { ok: true, customer, lead, sendResult });
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

      if (config.leadFlow?.enabled && payload?.startsWith("lead_answer:")) {
        const parsed = parseLeadAnswerPayload(payload);
        const latestLead = await findLatestLeadByCustomer(customer.id);
        if (parsed && latestLead) {
          await saveLeadAnswer({
            customerId: customer.id,
            leadId: latestLead.id,
            questionId: parsed.questionId,
            answer: parsed.answer
          });
          await updateLeadStatus(latestLead.id, "qualified_in_whatsapp");
        }
      }

      if (config.leadFlow?.enabled && payload?.startsWith("intro_call_request:")) {
        const latestLead = await findLatestLeadByCustomer(customer.id);
        const timing = parseIntroCallPayload(payload);
        if (latestLead) {
          await saveLeadAnswer({
            customerId: customer.id,
            leadId: latestLead.id,
            questionId: "intro_call_timing",
            answer: timing
          });
          await updateLeadStatus(latestLead.id, "intro_call_requested");
          if (ownerAlertChatId) {
            const answers = await getLeadAnswers(latestLead.id);
            await sendGreenApiInteractiveButtons({
              ...greenApiSettings,
              chatId: ownerAlertChatId,
              reply: {
                text: createLeadOwnerAlertText({ customer, lead: latestLead, answers, callTiming: timing }),
                buttons: []
              }
            });
          }
        }
      }

      if (payload?.startsWith("service_select:")) {
        const serviceId = payload.split(":")[1];
        const service = config.services.find((item) => item.id === serviceId);
        const serviceName = service?.name ?? serviceId;
        await createLead({ customerId: customer.id, serviceId, serviceName });
      }

      if (payload?.startsWith("slot_reserve:")) {
        const appointmentDetails = reply.appointment;
        if (appointmentDetails?.startsAt) {
          const service = config.services.find((item) => item.id === appointmentDetails.serviceId);
          const result = await scheduleAppointment({
            customerId: customer.id,
            serviceId: appointmentDetails.serviceId,
            serviceName: appointmentDetails.serviceName,
            startsAt: appointmentDetails.startsAt,
            durationMinutes: service?.durationMinutes ?? 60
          });

          if (result.conflict) {
            reply.text = "התור הזה כבר נתפס. אפשר לבחור מועד אחר.";
            reply.buttons = [{ text: "בחירת מועד אחר", payload: `service_select:${appointmentDetails.serviceId}` }];
          } else if (ownerAlertChatId) {
            reply.buttons = [
              { text: "ביטול תור", payload: `appointment_cancel:${result.appointment.id}` },
              { text: "נציג אנושי", payload: config.payloads.humanHelp }
            ];
            await sendGreenApiInteractiveButtons({
              ...greenApiSettings,
              chatId: ownerAlertChatId,
              reply: {
                text: createOwnerAlertText({ customer, serviceName: appointmentDetails.serviceName, appointment: result.appointment }),
                buttons: []
              }
            });
          }
        }
      }

      if (payload?.startsWith("service_select:") && ownerAlertChatId) {
        const serviceId = payload.split(":")[1];
        const service = config.services.find((item) => item.id === serviceId);
        await sendGreenApiInteractiveButtons({
          ...greenApiSettings,
          chatId: ownerAlertChatId,
          reply: {
            text: `לקוחה בחרה טיפול:\n\nלקוחה: ${customer.name || customer.phone}\nטלפון: ${customer.phone}\nטיפול: ${service?.name ?? serviceId}`,
            buttons: []
          }
        });
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
