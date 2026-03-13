import { v4 as uuidv4 } from "uuid";
import type { SkillExecution } from "@skillscope/shared";

export interface WrapOptions {
  skillName: string;
  skillFileHash: string;
  projectId: string;
}

export async function wrapExecution<T>(
  fn: (input: string) => Promise<T>,
  input: string,
  opts: WrapOptions
): Promise<{ execution: SkillExecution; result: T | null }> {
  const id = uuidv4();
  const startTime = Date.now();
  let output: string | null = null;
  let error: string | null = null;
  let success = false;
  let result: T | null = null;

  try {
    result = await fn(input);
    output = typeof result === "string" ? result : JSON.stringify(result);
    success = true;
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : String(err);
  }

  const durationMs = Date.now() - startTime;

  const execution: SkillExecution = {
    id,
    skillName: opts.skillName,
    skillFileHash: opts.skillFileHash,
    projectId: opts.projectId,
    input,
    output,
    error,
    success,
    durationMs,
    qualityScore: null,
    qualityRationale: null,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  return { execution, result };
}
