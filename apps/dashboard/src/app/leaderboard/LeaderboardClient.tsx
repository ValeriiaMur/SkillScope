"use client";
import { motion } from "framer-motion";
import { formatScore } from "@skillscope/shared";
import { ShimmerBadge } from "@/components/ShimmerBadge";
import { ScoreRing } from "@/components/ScoreRing";

interface Props {
  leaderboard: any[];
}

const medalColors = ["from-yellow-400 to-yellow-600", "from-gray-300 to-gray-500", "from-amber-600 to-amber-800"];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } };

export function LeaderboardClient({ leaderboard }: Props) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold font-display tracking-tight">Leaderboard</h1>
        <p className="mt-1.5 text-[hsl(var(--muted-foreground))]">
          Top-performing skills ranked by quality score
        </p>
      </motion.div>

      <div className="mt-8 space-y-3">
        {leaderboard.map((entry: any, idx: number) => (
          <motion.div
            key={entry.skill_name}
            variants={fadeUp}
            className="glass-card glass-card-glow flex items-center gap-4"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              idx < 3 ? `bg-gradient-to-br ${medalColors[idx]} text-black shadow-lg` : "bg-[hsla(240,5%,14%,0.5)] text-[hsl(var(--muted-foreground))]"
            } text-sm font-bold font-display`}>
              {idx + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold font-display">{entry.skill_name}</p>
                {entry.attestation_count > 0 && <ShimmerBadge>Verified</ShimmerBadge>}
              </div>
              <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                {entry.project_name || "—"} | <span className="font-mono">{entry.total_executions}</span> executions | <span className="font-mono">{entry.success_rate}%</span> success
              </p>
            </div>

            <ScoreRing score={entry.avg_score || 0} size={56} strokeWidth={4} />

            <div className="text-right min-w-[80px]">
              <p className="text-2xl font-bold font-display gradient-text">{formatScore(entry.avg_score)}</p>
              <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">avg score</p>
            </div>

            {entry.latest_tx_hash && (
              <a
                href={`https://sepolia.basescan.org/tx/${entry.latest_tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsla(240,5%,18%,0.5)] bg-[hsla(240,6%,8%,0.5)] hover:bg-[hsla(240,5%,14%,0.5)] transition-colors"
              >
                <svg className="h-4 w-4 text-[hsl(var(--muted-foreground))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </motion.div>
        ))}
        {leaderboard.length === 0 && (
          <motion.div variants={fadeUp} className="glass-card flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
            <div className="text-center">
              <svg className="mx-auto h-10 w-10 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <p className="mt-3">No scored skills yet. Run some executions to populate the leaderboard.</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
