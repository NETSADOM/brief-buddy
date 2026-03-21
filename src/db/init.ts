import { promises as fs } from "node:fs";
import path from "node:path";
import { pool } from "./queries";

export async function initializeDatabase(): Promise<void> {
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf-8");
  await pool.query(schemaSql);
}
