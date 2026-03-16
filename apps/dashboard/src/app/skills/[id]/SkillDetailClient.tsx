"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { TrendLine } from "@skillscope/ui";
import { formatScore, formatDuration, successRate } from "@skillscope/shared";
import { KpiCard } from "@/components/KpiCard";
import { ScoreRing } from "@/components/ScoreRing";
import { ShimmerBadge } from "@/components/ShimmerBadge";

interface Props {
  skillName: string;
  detail: { executions: any[]; attestations: any[] };
  trend: any[];
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } };

export function SkillDetailClient({ skillName, detail, trend }: Props) {
  const execs = detail.executions;
  const atts = detail.attestations;
  const totalExecs = execs.length;
  const successCount = execs.filter((e) => e.success).length;
  const scores = execs.map((e) => e.qualityScore).filter((s): s is number => s !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const avgDuration = totalExecs > 0 ? Math.round(execs.reduce((a, e) => a + e.durationMs, 0) / totalExecs) : 0;

  const trendData = trend.map((t: any) => ({
    label: new Date(t.timestamp).toLocaleDateString(),
    value: t.score,
  }));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Link href="/skills" className="hover:text-brand-400 transition-colors">Skills</Link>
          <span className="text-[hsl(var(--border))]">/</span>
          <span className="text-white">{skillName}</span>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <h1 className="text-3xl font-bold font-display tracking-tight">{skillName}</h1>
          {atts.length > 0 && <ShimmerBadge>Onchain Verified</ShimmerBadge>}
        </div>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <motion.div variants={fadeUp} className="glass-card glass-card-glow flex items-center justify-center lg:col-span-1">
          <ScoreRing score={avgScore} size={100} strokeWidth={6} label="Quality" />
        </motion.div>
        <div className="lg:col-span-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Executions" value={totalExecs} delay={0.05} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <KpiCard title="Success Rate" value={`${successRate(successCount, totalExecs)}%`} trend={successRate(successCount, totalExecs) > 80 ? "up" : "down"} delay={0.1} icon="M5 13l4 4L19 7" />
          <KpiCard title="Avg Score" value={formatScore(avgScore)} delay={0.15} icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          <KpiCard title="Avg Duration" value={formatDuration(avgDuration)} delay={0.2} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp} className="glass-card glass-card-glow">
          <h2 className="text-lg font-semibold font-display">Quality Score Trend</h2>
          <div className="mt-4">
            {trendData.length > 0 ? (
              <TrendLine data={trendData} height={250} color="#8b5cf6" />
            ) : (
              <div className="flex h-[250px] items-center justify-center text-[hsl(var(--muted-foreground))]">
                No scored executions yet
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card glass-card-glow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-display">Attestations</h2>
            <button className="btn-gradient">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Attest Onchain
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {atts.map((att: any) => (
              <div key={att.id} className="flex items-center justify-between rounded-xl border border-[hsla(240,5%,18%,0.5)] bg-[hsla(240,6%,8%,0.5)] p-3.5">
                <div>
                  <p className="text-sm font-semibold">Score: {att.score}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {att.executionCount} execs, {new Date(att.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`https://sepolia.basescan.org/tx/${att.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs gradient-text hover:opacity-80 font-mono transition-opacity"
                >
                  {att.txHash.slice(0, 10)}...
                </a>
              </div>
            ))}
            {atts.length === 0 && (
              <p className="py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                No attestations yet
              </p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="glass-card mt-8">
        <h2 className="text-lg font-semibold font-display">Execution History</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Score</th>
                <th>Duration</th>
                <th>Input</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {execs.slice(0, 25).map((exec: any) => (
                <tr key={exec.id}>
                  <td className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{exec.id.slice(0, 8)}</td>
                  <td>
                    <span className={exec.success ? "badge badge-success" : "badge badge-error"}>
                      {exec.success ? "Success" : "Failed"}
                    </span>
                  </td>
                  <td className="font-mono">{formatScore(exec.qualityScore)}</td>
                  <td className="text-[hsl(var(--muted-foreground))] font-mono">{formatDuration(exec.durationMs)}</td>
                  <td className="max-w-xs truncate text-[hsl(var(--muted-foreground))]">{exec.input}</td>
                  <td className="text-[hsl(var(--muted-foreground))]">{new Date(exec.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
