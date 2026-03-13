import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function hashFile(filePath: string): string {
  const content = readFileSync(filePath, "utf-8");
  return hashContent(content);
}
