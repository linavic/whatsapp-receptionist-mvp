import "../src/env.js";
import { getEnv } from "../src/env.js";

async function checkGreenApiState() {
  const baseUrl = getEnv("GREEN_API_BASE_URL", "https://api.green-api.com");
  const idInstance = getEnv("GREEN_ID_INSTANCE");
  const apiTokenInstance = getEnv("GREEN_API_TOKEN_INSTANCE");

  if (!idInstance || !apiTokenInstance) {
    return { name: "GREEN API", ok: false, error: "missing credentials" };
  }

  const url = `${baseUrl}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`;
  const response = await fetch(url);
  const body = await response.text();
  return {
    name: "GREEN API",
    ok: response.ok,
    status: response.status,
    body: safeBody(body)
  };
}

async function checkMakeWebhook() {
  const makeWebhookUrl = getEnv("MAKE_WEBHOOK_URL");
  if (!makeWebhookUrl) {
    return { name: "Make webhook", ok: false, error: "missing MAKE_WEBHOOK_URL" };
  }

  const response = await fetch(makeWebhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      source: "whatsapp-receptionist-live-check",
      event: "ping",
      timestamp: new Date().toISOString()
    })
  });
  const body = await response.text();
  return {
    name: "Make webhook",
    ok: response.ok,
    status: response.status,
    body: safeBody(body)
  };
}

function safeBody(body) {
  return body.replace(/[a-f0-9]{32,}/gi, "[redacted]").slice(0, 500);
}

const checks = [await checkGreenApiState(), await checkMakeWebhook()];

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}`);
  console.log(JSON.stringify(check, null, 2));
}

if (checks.some((check) => !check.ok)) process.exit(1);
