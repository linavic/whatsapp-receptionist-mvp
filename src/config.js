import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getEnv } from "./env.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function loadCustomerConfig() {
  const configPath = getEnv("CUSTOMER_CONFIG_PATH", "hebrew-beauty-clinic-config.json");
  const file = path.isAbsolute(configPath) ? configPath : path.join(rootDir, configPath);
  return JSON.parse(await readFile(file, "utf8"));
}
