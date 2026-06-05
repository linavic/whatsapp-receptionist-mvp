import "../src/env.js";
import { getEnv } from "../src/env.js";

const baseUrl = getEnv("GREEN_API_BASE_URL", "https://api.green-api.com");
const idInstance = getEnv("GREEN_ID_INSTANCE");
const apiTokenInstance = getEnv("GREEN_API_TOKEN_INSTANCE");
const makeWebhookUrl = getEnv("MAKE_WEBHOOK_URL");

if (!idInstance || !apiTokenInstance || !makeWebhookUrl) {
  console.error("Missing GREEN_ID_INSTANCE, GREEN_API_TOKEN_INSTANCE, or MAKE_WEBHOOK_URL");
  process.exit(1);
}

const settings = {
  webhookUrl: makeWebhookUrl,
  incomingWebhook: "yes",
  outgoingWebhook: "no",
  outgoingAPIMessageWebhook: "yes",
  stateWebhook: "yes",
  deviceWebhook: "yes",
  statusInstanceWebhook: "yes"
};

const response = await fetch(`${baseUrl}/waInstance${idInstance}/setSettings/${apiTokenInstance}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(settings)
});

const body = await response.text();
console.log(JSON.stringify({
  ok: response.ok,
  status: response.status,
  body: body.replace(/[a-f0-9]{32,}/gi, "[redacted]").slice(0, 500)
}, null, 2));

if (!response.ok) process.exit(1);
