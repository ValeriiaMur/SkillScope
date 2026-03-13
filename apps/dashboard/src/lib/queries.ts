import { db, executions, skills, attestations, projects } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export async function getOverviewStats() {
  const totalExecs = await db.select({ count: sql<number>`count(*)` }).from(executions).get();
  const successExecs = await db.select({ count: sql<number>`count(*)` }).from(executions).where(eq(executions.success, true)).get();
  const avgScore = await db.select({ avg: sql<number>`avg(quality_score)` }).from(executions).where(sql`quality_score IS NOT NULL`).get();
  const totalSkills = await db.select({ count: sql<number>`count(DISTINCT skill_name)` }).from(executions).get();
  const totalAttestations = await db.select({ count: sql<number>`count(*)` }).from(attestations).get();

  return {
    totalExecutions: totalExecs?.count || 0,
    successfulExecutions: successExecs?.count || 0,
    avgQualityScore: avgScore?.avg ? Math.round(avgScore.avg * 10) / 10 : null,
    totalSkills: totalSkills?.count || 0,
    totalAttestations: totalAttestations?.count || 0,
    successRate: (totalExecs?.count || 0) > 0 ? Math.round(((successExecs?.count || 0) / (totalExecs?.count || 1)) * 100) : 0,
  };
}

export async function getSkillsList() {
  const rows = await db.all(sql`
    SELECT
      e.skill_name,
      e.skill_file_hash,
      COUNT(*) as total_executions,
      SUM(CASE WHEN e.success = 1 THEN 1 ELSE 0 END) as success_count,
      ROUND(AVG(e.quality_score), 1) as avg_score,
      ROUND(AVG(e.duration_ms)) as avg_duration,
      MAX(e.timestamp) as last_executed,
      (SELECT COUNT(*) FROM attestations a WHERE a.skill_name = e.skill_name) as attestation_count
    FROM executions e
    GROUP BY e.skill_name
    ORDER BY avg_score DESC
  `);
  return rows;
}

export async function getSkillDetail(skillName: string) {
  const execs = await db
    .select()
    .from(executions)
    .where(eq(executions.skillName, skillName))
    .orderBy(desc(executions.timestamp))
    .all();

  const atts = await db
    .select()
    .from(attestations)
    .where(eq(attestations.skillName, skillName))
    .orderBy(desc(attestations.timestamp))
    .all();

  return { executions: execs, attestations: atts };
}

export async function getRecentExecutions(limit = 50) {
  return db
    .select()
    .from(executions)
    .orderBy(desc(executions.timestamp))
    .limit(limit)
    .all();
}

export async function getAllExecutions(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select()
    .from(executions)
    .orderBy(desc(executions.timestamp))
    .limit(pageSize)
    .offset(offset)
    .all();

  const total = await db.select({ count: sql<number>`count(*)` }).from(executions).get();

  return { rows, total: total?.count || 0, page, pageSize };
}

export async function getAllAttestations() {
  return db
    .select()
    .from(attestations)
    .orderBy(desc(attestations.timestamp))
    .all();
}

export async function getLeaderboard() {
  const rows = await db.all(sql`
    SELECT
      e.skill_name,
      p.name as project_name,
      ROUND(AVG(e.quality_score), 1) as avg_score,
      COUNT(*) as total_executions,
      ROUND(SUM(CASE WHEN e.success = 1 THEN 1.0 ELSE 0 END) / COUNT(*) * 100) as success_rate,
      (SELECT COUNT(*) FROM attestations a WHERE a.skill_name = e.skill_name) as attestation_count,
      (SELECT a.tx_hash FROM attestations a WHERE a.skill_name = e.skill_name ORDER BY a.timestamp DESC LIMIT 1) as latest_tx_hash
    FROM executions e
    LEFT JOIN projects p ON p.id = e.project_id
    WHERE e.quality_score IS NOT NULL
    GROUP BY e.skill_name
    ORDER BY avg_score DESC
  `);
  return rows;
}

export async function getScoreTrend(skillName: string) {
  return db.all(sql`
    SELECT timestamp, quality_score as score
    FROM executions
    WHERE skill_name = ${skillName} AND quality_score IS NOT NULL
    ORDER BY timestamp ASC
  `);
}
