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
  return JSON.parse(await readFile(dbPath, "utf8"));
}

export async function writeDb(db) {
  await ensureDb();
  await writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
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

export async function updateAppointmentStatus(appointmentId, status) {
  const db = await readDb();
  const appointment = db.appointments.find((item) => item.id === appointmentId);
  if (!appointment) return null;
  appointment.status = status;
  appointment.updatedAt = new Date().toISOString();
  await writeDb(db);
  return appointment;
}

