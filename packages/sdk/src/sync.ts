import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { SyncPayload, SyncResponse } from "@skillscope/shared";
import * as schema from "./db/schema.js";

type DB = BetterSQLite3Database<typeof schema>;

export async function syncExecutions(
  db: DB,
  projectId: string,
  dashboardUrl: string,
  projectName?: string
): Promise<SyncResponse> {
  // Get unsynced executions
  const unsynced = db
    .select()
    .from(schema.executions)
    .where(eq(schema.executions.synced, false))
    .all();

  if (unsynced.length === 0) {
    return { received: 0, errors: [] };
  }

  // Get all skill meta
  const meta = db.select().from(schema.skillMeta).all();

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
      db.update(schema.executions)
        .set({ synced: true })
        .where(eq(schema.executions.id, id))
        .run();
    }
  }

  return result;
}
