import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export interface DbConnection {
  db: LibSQLDatabase<typeof schema>;
  sqlite: Client;
}

export function createDb(dbPath: string): DbConnection {
  const sqlite = createClient({ url: `file:${dbPath}` });

  // Init tables synchronously isn't possible with libsql, so we return a promise-based init
  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}

export async function initTables(conn: DbConnection): Promise<void> {
  await conn.sqlite.executeMultiple(`
    CREATE TABLE IF NOT EXISTS executions (
      id TEXT PRIMARY KEY,
      skill_name TEXT NOT NULL,
      skill_file_hash TEXT NOT NULL,
      project_id TEXT NOT NULL,
      input TEXT NOT NULL,
      output TEXT,
      error TEXT,
      success INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      quality_score REAL,
      quality_rationale TEXT,
      timestamp TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skill_meta (
      skill_name TEXT PRIMARY KEY,
      skill_file_hash TEXT NOT NULL,
      file_path TEXT,
      description TEXT,
      registered_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_executions_skill ON executions(skill_name);
    CREATE INDEX IF NOT EXISTS idx_executions_synced ON executions(synced);
    CREATE INDEX IF NOT EXISTS idx_executions_timestamp ON executions(timestamp);
  `);
}

export { schema };
