/**
 * Seed the dashboard DB with demo data.
 * Run: npx tsx seed.ts
 */
import { createClient } from "@libsql/client";
import path from "node:path";
import { randomUUID } from "node:crypto";

const client = createClient({ url: `file:${path.join(process.cwd(), "dashboard.db")}` });

const skills = [
  { name: "code-review", hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2" },
  { name: "summarizer", hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3" },
  { name: "bug-finder", hash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4" },
  { name: "test-writer", hash: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5" },
  { name: "doc-generator", hash: "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6" },
  { name: "refactor-assistant", hash: "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1" },
];

const projectId = "demo-project";

async function seed() {
  // Init tables
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS skills (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, skill_name TEXT NOT NULL, skill_file_hash TEXT NOT NULL, file_path TEXT, description TEXT, registered_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(project_id, skill_name));
    CREATE TABLE IF NOT EXISTS executions (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, skill_name TEXT NOT NULL, skill_file_hash TEXT NOT NULL, input TEXT NOT NULL, output TEXT, error TEXT, success INTEGER NOT NULL, duration_ms INTEGER NOT NULL, quality_score REAL, quality_rationale TEXT, timestamp TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS attestations (id INTEGER PRIMARY KEY AUTOINCREMENT, skill_name TEXT NOT NULL, skill_file_hash TEXT NOT NULL, project_id TEXT NOT NULL, score REAL NOT NULL, execution_count INTEGER NOT NULL, success_count INTEGER NOT NULL, tx_hash TEXT NOT NULL, block_number INTEGER, chain TEXT NOT NULL DEFAULT 'base-sepolia', timestamp TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_exec_skill ON executions(skill_name);
    CREATE INDEX IF NOT EXISTS idx_exec_project ON executions(project_id);
    CREATE INDEX IF NOT EXISTS idx_exec_ts ON executions(timestamp);
  `);

  const now = new Date().toISOString();

  // Insert project
  await client.execute({
    sql: "INSERT OR IGNORE INTO projects (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
    args: [projectId, "SkillScope Demo", now, now],
  });

  // Insert skills and executions
  for (const skill of skills) {
    await client.execute({
      sql: "INSERT OR IGNORE INTO skills (project_id, skill_name, skill_file_hash, description, registered_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [projectId, skill.name, skill.hash, `Demo skill: ${skill.name}`, now, now],
    });

    // Generate 15-30 executions per skill
    const count = 15 + Math.floor(Math.random() * 16);
    for (let i = 0; i < count; i++) {
      const success = Math.random() > 0.15;
      const score = success ? 55 + Math.floor(Math.random() * 45) : null;
      const duration = 100 + Math.floor(Math.random() * 2000);
      const daysAgo = Math.floor(Math.random() * 14);
      const ts = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000).toISOString();

      await client.execute({
        sql: "INSERT OR IGNORE INTO executions (id, project_id, skill_name, skill_file_hash, input, output, error, success, duration_ms, quality_score, quality_rationale, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
          randomUUID(),
          projectId,
          skill.name,
          skill.hash,
          `Sample input for ${skill.name} execution #${i + 1}`,
          success ? `Completed ${skill.name} successfully with high quality output.` : null,
          success ? null : "Execution timed out",
          success ? 1 : 0,
          duration,
          score,
          score ? `Good execution with score ${score}/100` : null,
          ts,
        ],
      });
    }
  }

  // Add a couple attestations
  await client.execute({
    sql: "INSERT OR IGNORE INTO attestations (skill_name, skill_file_hash, project_id, score, execution_count, success_count, tx_hash, block_number, chain, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: ["code-review", skills[0].hash, projectId, 87.5, 25, 22, "0xabc123def456789abc123def456789abc123def456789abc123def456789abcdef", 12345678, "base-sepolia", now],
  });

  await client.execute({
    sql: "INSERT OR IGNORE INTO attestations (skill_name, skill_file_hash, project_id, score, execution_count, success_count, tx_hash, block_number, chain, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: ["summarizer", skills[1].hash, projectId, 92.1, 20, 19, "0xdef789abc123456789def789abc123456789def789abc123456789def789abcdef", 12345700, "base-sepolia", now],
  });

  console.log("Seeded dashboard with demo data!");
  console.log(`  - 1 project`);
  console.log(`  - ${skills.length} skills`);
  console.log(`  - ~130 executions`);
  console.log(`  - 2 attestations`);
}

seed().catch(console.error);
