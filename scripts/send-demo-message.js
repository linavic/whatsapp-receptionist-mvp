import "../src/env.js";
import { getEnv } from "../src/env.js";
import { loadCustomerConfig } from "../src/config.js";
import { createFirstReply } from "../src/flow.js";
import { sendGreenApiInteractiveButtons } from "../src/green-api-adapter.js";

const config = await loadCustomerConfig();
const chatId = getEnv("OWNER_ALERT_CHAT_ID");

if (!chatId) {
  console.error("Missing OWNER_ALERT_CHAT_ID");
  process.exit(1);
}

const result = await sendGreenApiInteractiveButtons({
  baseUrl: getEnv("GREEN_API_BASE_URL", "https://api.green-api.com"),
  idInstance: getEnv("GREEN_ID_INSTANCE"),
  apiTokenInstance: getEnv("GREEN_API_TOKEN_INSTANCE"),
  chatId,
  reply: createFirstReply(config)
});

console.log(JSON.stringify({
  ...result,
  body: typeof result.body === "string" ? result.body.replace(/[a-f0-9]{32,}/gi, "[redacted]").slice(0, 500) : result.body
}, null, 2));

if (!result.ok) process.exit(1);
