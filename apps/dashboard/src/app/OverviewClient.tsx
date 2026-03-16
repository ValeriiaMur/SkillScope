"use client";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/KpiCard";
import { ScoreRadar, TrendLine } from "@skillscope/ui";
import { formatScore, formatDuration } from "@skillscope/shared";

interface Props {
  stats: {
    totalExecutions: number;
    successfulExecutions: number;
    avgQualityScore: number | null;
    totalSkills: number;
    totalAttestations: number;
    successRate: number;
  };
  recentExecs: any[];
  skills: any[];
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } };

export function OverviewClient({ stats, recentExecs, skills }: Props) {
  const radarData = skills.slice(0, 6).map((s: any) => ({
    metric: s.skill_name.length > 12 ? s.skill_name.slice(0, 12) + "..." : s.skill_name,
    value: s.avg_score || 0,
  }));

  const trendData = recentExecs
    .filter((e: any) => e.qualityScore !== null)
    .reverse()
    .map((e: any, i: number) => ({
      label: `#${i + 1}`,
      value: e.qualityScore,
    }));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold font-display tracking-tight">Overview</h1>
        <p className="mt-1.5 text-[hsl(var(--muted-foreground))]">
          AI agent skill performance at a glance
        </p>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Executions"
          value={stats.totalExecutions}
          delay={0.05}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
        <KpiCard
          title="Avg Quality Score"
          value={formatScore(stats.avgQualityScore)}
          subtitle={`${stats.successRate}% success rate`}
          trend={stats.successRate > 80 ? "up" : stats.successRate > 50 ? "neutral" : "down"}
          delay={0.1}
          icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
        <KpiCard
          title="Skills Tracked"
          value={stats.totalSkills}
          delay={0.15}
          icon="M13 10V3L4 14h7v7l9-11h-7z"
        />
        <KpiCard
          title="Onchain Attestations"
          value={stats.totalAttestations}
          subtitle="Verified on Base"
          delay={0.2}
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp} className="glass-card glass-card-glow">
          <h2 className="text-lg font-semibold font-display">Skill Quality Radar</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Top skills by average score</p>
          <div className="mt-4">
            {radarData.length > 0 ? (
              <ScoreRadar data={radarData} color="#8b5cf6" />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-[hsl(var(--muted-foreground))]">
                No scored executions yet
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card glass-card-glow">
          <h2 className="text-lg font-semibold font-display">Quality Trend</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Recent execution scores</p>
          <div className="mt-4">
            {trendData.length > 0 ? (
              <TrendLine data={trendData} color="#8b5cf6" />
            ) : (
              <div className="flex h-[200px] items-center justify-center text-[hsl(var(--muted-foreground))]">
                No scored executions yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="glass-card mt-8">
        <h2 className="text-lg font-semibold font-display">Recent Executions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Status</th>
                <th>Score</th>
                <th>Duration</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentExecs.map((exec: any) => (
                <tr key={exec.id}>
                  <td className="font-medium">{exec.skillName}</td>
                  <td>
                    <span className={exec.success ? "badge badge-success" : "badge badge-error"}>
                      {exec.success ? "Success" : "Failed"}
                    </span>
                  </td>
                  <td className="font-mono">{formatScore(exec.qualityScore)}</td>
                  <td className="text-[hsl(var(--muted-foreground))]">{formatDuration(exec.durationMs)}</td>
                  <td className="text-[hsl(var(--muted-foreground))]">
                    {new Date(exec.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentExecs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[hsl(var(--muted-foreground))]">
                    No executions yet. Sync data from the SDK to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
