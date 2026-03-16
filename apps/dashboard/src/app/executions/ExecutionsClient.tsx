"use client";
import { motion } from "framer-motion";
import { formatScore, formatDuration } from "@skillscope/shared";
import Link from "next/link";

interface Props {
  data: { rows: any[]; total: number; page: number; pageSize: number };
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } };

export function ExecutionsClient({ data }: Props) {
  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold font-display tracking-tight">Executions</h1>
        <p className="mt-1.5 text-[hsl(var(--muted-foreground))]">
          <span className="font-mono text-white">{data.total}</span> total executions logged
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card mt-8">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Skill</th>
                <th>Status</th>
                <th>Score</th>
                <th>Duration</th>
                <th>Input</th>
                <th>Output</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((exec: any, idx: number) => (
                <motion.tr
                  key={exec.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <td className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{exec.id.slice(0, 8)}</td>
                  <td>
                    <Link href={`/skills/${encodeURIComponent(exec.skillName)}`} className="font-semibold gradient-text hover:opacity-80 transition-opacity">
                      {exec.skillName}
                    </Link>
                  </td>
                  <td>
                    <span className={exec.success ? "badge badge-success" : "badge badge-error"}>
                      {exec.success ? "OK" : "Fail"}
                    </span>
                  </td>
                  <td className="font-mono">{formatScore(exec.qualityScore)}</td>
                  <td className="text-[hsl(var(--muted-foreground))] font-mono">{formatDuration(exec.durationMs)}</td>
                  <td className="max-w-[200px] truncate text-[hsl(var(--muted-foreground))]">{exec.input}</td>
                  <td className="max-w-[200px] truncate text-[hsl(var(--muted-foreground))]">{exec.output || exec.error || "—"}</td>
                  <td className="text-[hsl(var(--muted-foreground))] whitespace-nowrap">{new Date(exec.timestamp).toLocaleString()}</td>
                </motion.tr>
              ))}
              {data.rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[hsl(var(--muted-foreground))]">
                    No executions yet. Sync data from the SDK to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-[hsla(240,5%,18%,0.5)] pt-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Page <span className="font-mono text-white">{data.page}</span> of <span className="font-mono text-white">{totalPages}</span>
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
