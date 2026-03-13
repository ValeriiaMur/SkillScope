import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const executions = sqliteTable("executions", {
  id: text("id").primaryKey(),
  skillName: text("skill_name").notNull(),
  skillFileHash: text("skill_file_hash").notNull(),
  projectId: text("project_id").notNull(),
  input: text("input").notNull(),
  output: text("output"),
  error: text("error"),
  success: integer("success", { mode: "boolean" }).notNull(),
  durationMs: integer("duration_ms").notNull(),
  qualityScore: real("quality_score"),
  qualityRationale: text("quality_rationale"),
  timestamp: text("timestamp").notNull(),
  synced: integer("synced", { mode: "boolean" }).notNull().default(false),
});

export const skillMeta = sqliteTable("skill_meta", {
  skillName: text("skill_name").primaryKey(),
  skillFileHash: text("skill_file_hash").notNull(),
  filePath: text("file_path"),
  description: text("description"),
  registeredAt: text("registered_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
