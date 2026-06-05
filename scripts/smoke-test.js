import { loadCustomerConfig } from "../src/config.js";
import { createFirstReply, handlePayload } from "../src/flow.js";
import { toGreenApiInteractiveButtons } from "../src/green-api-adapter.js";

const config = await loadCustomerConfig();

const checks = config.leadFlow?.enabled
  ? [
      ["first lead reply has buttons", () => createFirstReply(config).buttons.length === 3],
      ["lead answer advances question", () => handlePayload(config, "lead_answer:interest:pricing").buttons[0].payload.startsWith("lead_answer:goal:")],
      ["second lead answer advances to intro call", () => handlePayload(config, "lead_answer:goal:more_leads").buttons[0].payload.startsWith("intro_call_request:")],
      ["intro call request confirms human followup", () => handlePayload(config, "intro_call_request:today").text.includes("שיחת היכרות")],
      ["green api payload includes chat id", () => toGreenApiInteractiveButtons("972500000000@c.us", createFirstReply(config)).chatId === "972500000000@c.us"]
    ]
  : [
      ["first reply has buttons", () => createFirstReply(config).buttons.length === 3],
      ["start booking shows services", () => handlePayload(config, "start_booking").buttons[0].payload.startsWith("service_select:")],
      ["service selection offers slots", () => handlePayload(config, "service_select:facial").buttons[0].payload.startsWith("slot_reserve:facial:")],
      ["slot reserve confirms appointment", () => handlePayload(config, handlePayload(config, "service_select:facial").buttons[0].payload).appointment?.startsAt],
      ["cancel offers rebooking", () => handlePayload(config, "appointment_cancel:apt_123").buttons[0].payload === "start_booking"],
      ["unknown payload falls back", () => handlePayload(config, "unknown:123").buttons.length === 2],
      ["green api payload includes chat id", () => toGreenApiInteractiveButtons("972500000000@c.us", createFirstReply(config)).chatId === "972500000000@c.us"]
    ];

let failed = 0;

for (const [name, check] of checks) {
  if (check()) {
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    console.error(`FAIL ${name}`);
  }
}

if (failed > 0) process.exit(1);
