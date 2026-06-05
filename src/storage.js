import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "db.json");

const initialDb = {
  customers: [],
  leads: [],
  appointments: [],
  leadAnswers: [],
  events: []
};

async function ensureDb() {
  await mkdir(dataDir, { recursive: true });
  if (!existsSync(dbPath)) {
    await writeFile(dbPath, JSON.stringify(initialDb, null, 2), "utf8");
  }
}

export async function readDb() {
  await ensureDb();
  const db = JSON.parse(await readFile(dbPath, "utf8"));
  return normalizeDb(db);
}

export async function writeDb(db) {
  await ensureDb();
  await writeFile(dbPath, JSON.stringify(normalizeDb(db), null, 2), "utf8");
}

function normalizeDb(db) {
  return {
    customers: Array.isArray(db.customers) ? db.customers : [],
    leads: Array.isArray(db.leads) ? db.leads : [],
    appointments: Array.isArray(db.appointments) ? db.appointments : [],
    leadAnswers: Array.isArray(db.leadAnswers) ? db.leadAnswers : [],
    events: Array.isArray(db.events) ? db.events : []
  };
}

export async function logEvent(type, payload) {
  const db = await readDb();
  db.events.push({
    id: `evt_${Date.now()}_${db.events.length + 1}`,
    type,
    payload,
    createdAt: new Date().toISOString()
  });
  await writeDb(db);
}

export async function upsertCustomer({ phone, name = "", chatId = "" }) {
  const db = await readDb();
  let customer = db.customers.find((item) => item.phone === phone || item.chatId === chatId);
  if (!customer) {
    customer = {
      id: `cus_${Date.now()}_${db.customers.length + 1}`,
      phone,
      chatId,
      name,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      status: "active"
    };
    db.customers.push(customer);
  } else {
    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.chatId = chatId || customer.chatId;
    customer.lastSeenAt = new Date().toISOString();
  }
  await writeDb(db);
  return customer;
}

export async function createLead({ customerId, serviceId, serviceName }) {
  const db = await readDb();
  const lead = {
    id: `lead_${Date.now()}_${db.leads.length + 1}`,
    customerId,
    serviceId,
    serviceName,
    status: "new",
    followupStep: 0,
    createdAt: new Date().toISOString()
  };
  db.leads.push(lead);
  await writeDb(db);
  return lead;
}

export async function createSiteLead({ customerId, source = "website", form = {} }) {
  const db = await readDb();
  const lead = {
    id: `lead_${Date.now()}_${db.leads.length + 1}`,
    customerId,
    serviceId: "flashmodel",
    serviceName: "Flash Model",
    status: "new_site_lead",
    source,
    form,
    followupStep: 0,
    createdAt: new Date().toISOString()
  };
  db.leads.push(lead);
  await writeDb(db);
  return lead;
}

export async function findLatestLeadByCustomer(customerId) {
  const db = await readDb();
  return [...db.leads].reverse().find((lead) => lead.customerId === customerId) ?? null;
}

export async function saveLeadAnswer({ customerId, leadId, questionId, answer }) {
  const db = await readDb();
  const item = {
    id: `ans_${Date.now()}_${db.leadAnswers.length + 1}`,
    customerId,
    leadId,
    questionId,
    answer,
    createdAt: new Date().toISOString()
  };
  db.leadAnswers.push(item);
  await writeDb(db);
  return item;
}

export async function getLeadAnswers(leadId) {
  const db = await readDb();
  return db.leadAnswers.filter((answer) => answer.leadId === leadId);
}

export async function updateLeadStatus(leadId, status) {
  const db = await readDb();
  const lead = db.leads.find((item) => item.id === leadId);
  if (!lead) return null;
  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  await writeDb(db);
  return lead;
}

export async function createAppointmentRequest({ customerId, serviceId, serviceName }) {
  const db = await readDb();
  const appointment = {
    id: `apt_${Date.now()}_${db.appointments.length + 1}`,
    customerId,
    serviceId,
    serviceName,
    startsAt: null,
    endsAt: null,
    status: "requested",
    source: "whatsapp",
    createdAt: new Date().toISOString()
  };
  db.appointments.push(appointment);
  await writeDb(db);
  return appointment;
}

export async function scheduleAppointment({ customerId, serviceId, serviceName, startsAt, durationMinutes = 60 }) {
  const db = await readDb();
  const existing = db.appointments.find((item) => item.startsAt === startsAt && item.status === "confirmed");
  if (existing) return { appointment: existing, conflict: true };

  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const appointment = {
    id: `apt_${Date.now()}_${db.appointments.length + 1}`,
    customerId,
    serviceId,
    serviceName,
    startsAt,
    endsAt: end.toISOString(),
    status: "confirmed",
    source: "whatsapp",
    createdAt: new Date().toISOString()
  };
  db.appointments.push(appointment);
  await writeDb(db);
  return { appointment, conflict: false };
}

export async function updateAppointmentStatus(appointmentId, status) {
  const db = await readDb();
  const appointment = db.appointments.find((item) => item.id === appointmentId);
  if (!appointment) return null;
  appointment.status = status;
  appointment.updatedAt = new Date().toISOString();
  await writeDb(db);
  return appointment;
}
