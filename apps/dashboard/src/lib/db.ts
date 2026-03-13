import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import path from "node:path";

// ── Schema ──

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const skills = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: text("project_id").notNull(),
  skillName: text("skill_name").notNull(),
  skillFileHash: text("skill_file_hash").notNull(),
  filePath: text("file_path"),
  description: text("description"),
  registeredAt: text("registered_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const executions = sqliteTable("executions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  skillName: text("skill_name").notNull(),
  skillFileHash: text("skill_file_hash").notNull(),
  input: text("input").notNull(),
  output: text("output"),
  error: text("error"),
  success: integer("success", { mode: "boolean" }).notNull(),
  durationMs: integer("duration_ms").notNull(),
  qualityScore: real("quality_score"),
  qualityRationale: text("quality_rationale"),
  timestamp: text("timestamp").notNull(),
});

export const attestations = sqliteTable("attestations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  skillName: text("skill_name").notNull(),
  skillFileHash: text("skill_file_hash").notNull(),
  projectId: text("project_id").notNull(),
  score: real("score").notNull(),
  executionCount: integer("execution_count").notNull(),
  successCount: integer("success_count").notNull(),
  txHash: text("tx_hash").notNull(),
  blockNumber: integer("block_number"),
  chain: text("chain").notNull().default("base-sepolia"),
  timestamp: text("timestamp").notNull(),
});

// ── Connection ──

const schema = { projects, skills, executions, attestations };

const DB_PATH = path.join(process.cwd(), "dashboard.db");

const client = createClient({ url: `file:${DB_PATH}` });

// Initialize tables synchronously via batch
client.executeMultiple(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    skill_file_hash TEXT NOT NULL,
    file_path TEXT,
    description TEXT,
    registered_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(project_id, skill_name)
  );
  CREATE TABLE IF NOT EXISTS executions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    skill_file_hash TEXT NOT NULL,
    input TEXT NOT NULL,
    output TEXT,
    error TEXT,
    success INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    quality_score REAL,
    quality_rationale TEXT,
    timestamp TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS attestations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name TEXT NOT NULL,
    skill_file_hash TEXT NOT NULL,
    project_id TEXT NOT NULL,
    score REAL NOT NULL,
    execution_count INTEGER NOT NULL,
    success_count INTEGER NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number INTEGER,
    chain TEXT NOT NULL DEFAULT 'base-sepolia',
    timestamp TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_exec_skill ON executions(skill_name);
  CREATE INDEX IF NOT EXISTS idx_exec_project ON executions(project_id);
  CREATE INDEX IF NOT EXISTS idx_exec_ts ON executions(timestamp);
`);

export const db = drizzle(client, { schema });
