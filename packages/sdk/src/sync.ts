import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { SyncPayload, SyncResponse } from "@skillscope/shared";
import * as schema from "./db/schema.js";

type DB = LibSQLDatabase<typeof schema>;

export async function syncExecutions(
  db: DB,
  projectId: string,
  dashboardUrl: string,
  projectName?: string
): Promise<SyncResponse> {
  // Get unsynced executions
  const unsynced = await db
    .select()
    .from(schema.executions)
    .where(eq(schema.executions.synced, false))
    .all();

  if (unsynced.length === 0) {
    return { received: 0, errors: [] };
  }

  // Get all skill meta
  const meta = await db.select().from(schema.skillMeta).all();

  const payload: SyncPayload = {
    projectId,
    projectName,
    executions: unsynced.map((e) => ({
      ...e,
      success: Boolean(e.success),
      synced: Boolean(e.synced),
    })),
    skillMeta: meta.map((m) => ({
      ...m,
      filePath: m.filePath,
      description: m.description,
    })),
  };

  const res = await fetch(`${dashboardUrl}/api/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Sync failed: ${res.status} ${res.statusText}`);
  }

  const result: SyncResponse = await res.json();

  // Mark as synced
  if (result.received > 0) {
    const ids = unsynced.map((e) => e.id);
    for (const id of ids) {
      await db.update(schema.executions)
        .set({ synced: true })
        .where(eq(schema.executions.id, id))
        .run();
    }
  }

  return result;
}
