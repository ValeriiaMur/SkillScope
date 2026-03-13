import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import type { SyncPayload, SyncResponse } from "@skillscope/shared";

export async function POST(req: NextRequest) {
  try {
    const payload: SyncPayload = await req.json();
    const errors: string[] = [];
    let received = 0;

    const now = new Date().toISOString();

    // Upsert project
    await db.run(sql`
      INSERT INTO projects (id, name, created_at, updated_at)
      VALUES (${payload.projectId}, ${payload.projectName || payload.projectId}, ${now}, ${now})
      ON CONFLICT(id) DO UPDATE SET name = ${payload.projectName || payload.projectId}, updated_at = ${now}
    `);

    // Upsert skill meta
    for (const meta of payload.skillMeta) {
      try {
        await db.run(sql`
          INSERT INTO skills (project_id, skill_name, skill_file_hash, file_path, description, registered_at, updated_at)
          VALUES (${payload.projectId}, ${meta.skillName}, ${meta.skillFileHash}, ${meta.filePath}, ${meta.description}, ${meta.registeredAt}, ${meta.updatedAt})
          ON CONFLICT(project_id, skill_name) DO UPDATE SET
            skill_file_hash = ${meta.skillFileHash},
            file_path = ${meta.filePath},
            description = ${meta.description},
            updated_at = ${meta.updatedAt}
        `);
      } catch (e: unknown) {
        errors.push(`skill meta ${meta.skillName}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Insert executions
    for (const exec of payload.executions) {
      try {
        await db.run(sql`
          INSERT OR IGNORE INTO executions (id, project_id, skill_name, skill_file_hash, input, output, error, success, duration_ms, quality_score, quality_rationale, timestamp)
          VALUES (${exec.id}, ${exec.projectId}, ${exec.skillName}, ${exec.skillFileHash}, ${exec.input}, ${exec.output}, ${exec.error}, ${exec.success ? 1 : 0}, ${exec.durationMs}, ${exec.qualityScore}, ${exec.qualityRationale}, ${exec.timestamp})
        `);
        received++;
      } catch (e: unknown) {
        errors.push(`execution ${exec.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const response: SyncResponse = { received, errors };
    return NextResponse.json(response);
  } catch (e: unknown) {
    return NextResponse.json(
      { received: 0, errors: [e instanceof Error ? e.message : "Unknown error"] },
      { status: 500 }
    );
  }
}
