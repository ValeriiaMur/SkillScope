"use client";
import { motion } from "framer-motion";
import { formatScore } from "@skillscope/shared";

interface Props {
  leaderboard: any[];
}

const medalColors = ["from-yellow-400 to-yellow-600", "from-gray-300 to-gray-500", "from-amber-600 to-amber-800"];

export function LeaderboardClient({ leaderboard }: Props) {
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Top-performing skills ranked by quality score
        </p>
      </motion.div>

      <div className="mt-8 space-y-3">
        {leaderboard.map((entry: any, idx: number) => (
          <motion.div
            key={entry.skill_name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card flex items-center gap-4"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              idx < 3 ? `bg-gradient-to-br ${medalColors[idx]} text-black` : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            } text-sm font-bold`}>
              {idx + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{entry.skill_name}</p>
                {entry.attestation_count > 0 && (
                  <span className="badge badge-attested">Attested</span>
                )}
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {entry.project_name || "—"} | {entry.total_executions} executions | {entry.success_rate}% success
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-brand-400">{formatScore(entry.avg_score)}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">avg score</p>
            </div>

            {entry.latest_tx_hash && (
              <a
                href={`https://sepolia.basescan.org/tx/${entry.latest_tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[hsl(var(--border))] p-2 hover:bg-[hsl(var(--accent))] transition-colors"
              >
                <svg className="h-4 w-4 text-[hsl(var(--muted-foreground))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </motion.div>
        ))}
        {leaderboard.length === 0 && (
          <div className="card flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
            No scored skills yet. Run some executions and sync to populate the leaderboard.
          </div>
        )}
      </div>
    </div>
  );
}
