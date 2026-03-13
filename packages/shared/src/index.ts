// ── Core Types ──

export interface SkillScopeConfig {
  projectId: string;
  projectName?: string;
  dbPath?: string;
  dashboardUrl?: string;
  anthropicApiKey?: string;
  scoringModel?: string;
  autoScore?: boolean;
  autoSync?: boolean;
  syncIntervalMs?: number;
  rpcUrl?: string;
  contractAddress?: string;
  privateKey?: string;
}

export interface SkillExecution {
  id: string;
  skillName: string;
  skillFileHash: string;
  projectId: string;
  input: string;
  output: string | null;
  error: string | null;
  success: boolean;
  durationMs: number;
  qualityScore: number | null;
  qualityRationale: string | null;
  timestamp: string;
  synced: boolean;
}

export interface SkillStats {
  skillName: string;
  skillFileHash: string;
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  avgDurationMs: number;
  avgQualityScore: number | null;
  minQualityScore: number | null;
  maxQualityScore: number | null;
  lastExecutedAt: string | null;
}

export interface SkillMeta {
  skillName: string;
  skillFileHash: string;
  filePath: string | null;
  description: string | null;
  registeredAt: string;
  updatedAt: string;
}

export interface SyncPayload {
  projectId: string;
  projectName?: string;
  executions: SkillExecution[];
  skillMeta: SkillMeta[];
}

export interface SyncResponse {
  received: number;
  errors: string[];
}

export interface AttestationData {
  skillFileHash: string;
  skillName: string;
  score: number;
  executionCount: number;
  successCount: number;
  timestamp: number;
  erc8004AgentId?: string;
}

export interface AttestationResult {
  txHash: string;
  blockNumber: number;
  attestationId: string;
  explorerUrl: string;
}

// ── Dashboard Types ──

export interface DashboardProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  skillName: string;
  projectName: string;
  avgScore: number;
  totalExecutions: number;
  successRate: number;
  attested: boolean;
  attestationTxHash: string | null;
}

// ── Utility ──

export function formatScore(score: number | null): string {
  if (score === null) return "—";
  return score.toFixed(1);
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function successRate(success: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((success / total) * 100);
}
