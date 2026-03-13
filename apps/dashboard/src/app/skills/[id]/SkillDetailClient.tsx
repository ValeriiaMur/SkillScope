"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { TrendLine } from "@skillscope/ui";
import { formatScore, formatDuration, successRate } from "@skillscope/shared";
import { KpiCard } from "@/components/KpiCard";

interface Props {
  skillName: string;
  detail: { executions: any[]; attestations: any[] };
  trend: any[];
}

export function SkillDetailClient({ skillName, detail, trend }: Props) {
  const execs = detail.executions;
  const atts = detail.attestations;
  const totalExecs = execs.length;
  const successCount = execs.filter((e) => e.success).length;
  const scores = execs.map((e) => e.qualityScore).filter((s): s is number => s !== null);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const avgDuration = totalExecs > 0 ? Math.round(execs.reduce((a, e) => a + e.durationMs, 0) / totalExecs) : 0;

  const trendData = trend.map((t: any, i: number) => ({
    label: new Date(t.timestamp).toLocaleDateString(),
    value: t.score,
  }));

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Link href="/skills" className="hover:text-brand-400">Skills</Link>
          <span>/</span>
          <span className="text-[hsl(var(--foreground))]">{skillName}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{skillName}</h1>
      </motion.div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Executions" value={totalExecs} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <KpiCard title="Success Rate" value={`${successRate(successCount, totalExecs)}%`} trend={successRate(successCount, totalExecs) > 80 ? "up" : "down"} icon="M5 13l4 4L19 7" />
        <KpiCard title="Avg Score" value={formatScore(avgScore)} icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        <KpiCard title="Avg Duration" value={formatDuration(avgDuration)} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold">Quality Score Trend</h2>
          <div className="mt-4">
            {trendData.length > 0 ? (
              <TrendLine data={trendData} height={250} />
            ) : (
              <div className="flex h-[250px] items-center justify-center text-[hsl(var(--muted-foreground))]">
                No scored executions yet
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Attestations</h2>
            <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
              Attest Onchain
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {atts.map((att: any) => (
              <div key={att.id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
                <div>
                  <p className="text-sm font-medium">Score: {att.score}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {att.executionCount} execs, {new Date(att.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`https://sepolia.basescan.org/tx/${att.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-400 hover:text-brand-300 font-mono"
                >
                  {att.txHash.slice(0, 10)}...
                </a>
              </div>
            ))}
            {atts.length === 0 && (
              <p className="py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                No attestations yet
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-8">
        <h2 className="text-lg font-semibold">Execution History</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">ID</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Score</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Duration</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Input</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Time</th>
              </tr>
            </thead>
            <tbody>
              {execs.slice(0, 25).map((exec: any) => (
                <tr key={exec.id} className="border-b border-[hsl(var(--border))]/50">
                  <td className="py-3 font-mono text-xs">{exec.id.slice(0, 8)}</td>
                  <td className="py-3">
                    <span className={exec.success ? "badge badge-success" : "badge badge-error"}>
                      {exec.success ? "Success" : "Failed"}
                    </span>
                  </td>
                  <td className="py-3">{formatScore(exec.qualityScore)}</td>
                  <td className="py-3 text-[hsl(var(--muted-foreground))]">{formatDuration(exec.durationMs)}</td>
                  <td className="py-3 max-w-xs truncate text-[hsl(var(--muted-foreground))]">{exec.input}</td>
                  <td className="py-3 text-[hsl(var(--muted-foreground))]">{new Date(exec.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
