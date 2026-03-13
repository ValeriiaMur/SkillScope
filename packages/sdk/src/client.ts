import { eq, sql, desc, and } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type {
  SkillScopeConfig,
  SkillExecution,
  SkillStats,
  AttestationData,
  AttestationResult,
} from "@skillscope/shared";
import { createDb, schema } from "./db/index.js";
import { hashFile, hashContent } from "./hasher.js";
import { wrapExecution } from "./wrapper.js";
import { scoreExecution } from "./scorer.js";
import { syncExecutions } from "./sync.js";
import { attestOnchain } from "./attest.js";
import type { Hex } from "viem";
import type Database from "better-sqlite3";

export class SkillScope {
  private db: BetterSQLite3Database<typeof schema>;
  private sqlite: Database.Database;
  private config: SkillScopeConfig;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: SkillScopeConfig) {
    this.config = {
      dbPath: `.skillscope-${config.projectId}.db`,
      scoringModel: "claude-sonnet-4-20250514",
      autoScore: true,
      autoSync: false,
      syncIntervalMs: 60_000,
      ...config,
    };

    const { db, sqlite } = createDb(this.config.dbPath!);
    this.db = db;
    this.sqlite = sqlite;

    if (this.config.autoSync && this.config.dashboardUrl) {
      this.startAutoSync();
    }
  }

  /**
   * Register a skill by file path or content.
   */
  registerSkill(
    skillName: string,
    filePathOrContent: string,
    description?: string
  ): string {
    const isFile = filePathOrContent.endsWith(".md") || filePathOrContent.includes("/");
    const hash = isFile
      ? hashFile(filePathOrContent)
      : hashContent(filePathOrContent);

    const now = new Date().toISOString();
    const existing = this.db
      .select()
      .from(schema.skillMeta)
      .where(eq(schema.skillMeta.skillName, skillName))
      .get();

    if (existing) {
      this.db
        .update(schema.skillMeta)
        .set({
          skillFileHash: hash,
          filePath: isFile ? filePathOrContent : null,
          description: description || existing.description,
          updatedAt: now,
        })
        .where(eq(schema.skillMeta.skillName, skillName))
        .run();
    } else {
      this.db
        .insert(schema.skillMeta)
        .values({
          skillName,
          skillFileHash: hash,
          filePath: isFile ? filePathOrContent : null,
          description: description || null,
          registeredAt: now,
          updatedAt: now,
        })
        .run();
    }

    return hash;
  }

  /**
   * Wrap a skill function for execution tracking.
   */
  wrapSkill<T>(
    skillName: string,
    fn: (input: string) => Promise<T>
  ): (input: string) => Promise<T> {
    return async (input: string): Promise<T> => {
      const meta = this.db
        .select()
        .from(schema.skillMeta)
        .where(eq(schema.skillMeta.skillName, skillName))
        .get();

      if (!meta) {
        throw new Error(
          `Skill "${skillName}" not registered. Call registerSkill() first.`
        );
      }

      const { execution, result } = await wrapExecution(fn, input, {
        skillName,
        skillFileHash: meta.skillFileHash,
        projectId: this.config.projectId,
      });

      // Auto-score if enabled and execution succeeded
      if (
        this.config.autoScore &&
        this.config.anthropicApiKey &&
        execution.success &&
        execution.output
      ) {
        try {
          const score = await scoreExecution(
            skillName,
            input,
            execution.output,
            this.config.anthropicApiKey,
            this.config.scoringModel
          );
          execution.qualityScore = score.score;
          execution.qualityRationale = score.rationale;
        } catch {
          // Scoring failure shouldn't break execution
        }
      }

      // Save execution
      this.db
        .insert(schema.executions)
        .values({
          ...execution,
          success: execution.success ? 1 : (0 as any),
          synced: false as any,
        })
        .run();

      if (result === null && execution.error) {
        throw new Error(execution.error);
      }

      return result as T;
    };
  }

  /**
   * Record an execution manually.
   */
  recordExecution(execution: SkillExecution): void {
    this.db
      .insert(schema.executions)
      .values({
        ...execution,
        success: execution.success ? 1 : (0 as any),
        synced: false as any,
      })
      .run();
  }

  /**
   * Get stats for a specific skill.
   */
  getSkillStats(skillName: string): SkillStats | null {
    const rows = this.db
      .select()
      .from(schema.executions)
      .where(eq(schema.executions.skillName, skillName))
      .all();

    if (rows.length === 0) return null;

    const successRows = rows.filter((r) => r.success);
    const scores = rows
      .map((r) => r.qualityScore)
      .filter((s): s is number => s !== null);

    return {
      skillName,
      skillFileHash: rows[0].skillFileHash,
      totalExecutions: rows.length,
      successCount: successRows.length,
      failureCount: rows.length - successRows.length,
      avgDurationMs: Math.round(
        rows.reduce((a, r) => a + r.durationMs, 0) / rows.length
      ),
      avgQualityScore:
        scores.length > 0
          ? scores.reduce((a, s) => a + s, 0) / scores.length
          : null,
      minQualityScore: scores.length > 0 ? Math.min(...scores) : null,
      maxQualityScore: scores.length > 0 ? Math.max(...scores) : null,
      lastExecutedAt: rows.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0].timestamp,
    };
  }

  /**
   * Get all executions, optionally filtered by skill.
   */
  getExecutions(skillName?: string, limit = 100): SkillExecution[] {
    const query = skillName
      ? this.db
          .select()
          .from(schema.executions)
          .where(eq(schema.executions.skillName, skillName))
          .orderBy(desc(schema.executions.timestamp))
          .limit(limit)
      : this.db
          .select()
          .from(schema.executions)
          .orderBy(desc(schema.executions.timestamp))
          .limit(limit);

    return query.all().map((e) => ({
      ...e,
      success: Boolean(e.success),
      synced: Boolean(e.synced),
    }));
  }

  /**
   * Sync local data to dashboard.
   */
  async sync(): Promise<{ received: number; errors: string[] }> {
    if (!this.config.dashboardUrl) {
      throw new Error("dashboardUrl not configured");
    }
    return syncExecutions(
      this.db,
      this.config.projectId,
      this.config.dashboardUrl,
      this.config.projectName
    );
  }

  /**
   * Attest skill quality onchain.
   */
  async attest(skillName: string): Promise<AttestationResult> {
    if (!this.config.contractAddress || !this.config.privateKey) {
      throw new Error("Contract address and private key required for attestation");
    }

    const stats = this.getSkillStats(skillName);
    if (!stats || stats.avgQualityScore === null) {
      throw new Error(`No scored executions found for skill "${skillName}"`);
    }

    const data: AttestationData = {
      skillFileHash: stats.skillFileHash,
      skillName,
      score: stats.avgQualityScore,
      executionCount: stats.totalExecutions,
      successCount: stats.successCount,
      timestamp: Math.floor(Date.now() / 1000),
    };

    return attestOnchain(data, {
      contractAddress: this.config.contractAddress as `0x${string}`,
      privateKey: this.config.privateKey as `0x${string}`,
      rpcUrl: this.config.rpcUrl,
    });
  }

  /**
   * Close the database connection.
   */
  close(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.sqlite.close();
  }

  private startAutoSync(): void {
    this.syncInterval = setInterval(() => {
      this.sync().catch(() => {});
    }, this.config.syncIntervalMs!);
  }
}
