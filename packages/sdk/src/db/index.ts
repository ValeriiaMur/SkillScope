import Database, { type Database as DatabaseType } from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

export interface DbConnection {
  db: BetterSQLite3Database<typeof schema>;
  sqlite: DatabaseType;
}

export function createDb(dbPath: string): DbConnection {
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");

  sqlite.exec(`
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

  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}

export { schema };
