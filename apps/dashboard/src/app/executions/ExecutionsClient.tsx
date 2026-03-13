"use client";
import { motion } from "framer-motion";
import { formatScore, formatDuration } from "@skillscope/shared";
import Link from "next/link";

interface Props {
  data: { rows: any[]; total: number; page: number; pageSize: number };
}

export function ExecutionsClient({ data }: Props) {
  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Executions</h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          {data.total} total executions logged
        </p>
      </motion.div>

      <div className="card mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">ID</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Skill</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Score</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Duration</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Input</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Output</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((exec: any, idx: number) => (
                <motion.tr
                  key={exec.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--accent))]/50"
                >
                  <td className="py-3 font-mono text-xs">{exec.id.slice(0, 8)}</td>
                  <td className="py-3">
                    <Link href={`/skills/${encodeURIComponent(exec.skillName)}`} className="text-brand-400 hover:text-brand-300">
                      {exec.skillName}
                    </Link>
                  </td>
                  <td className="py-3">
                    <span className={exec.success ? "badge badge-success" : "badge badge-error"}>
                      {exec.success ? "OK" : "Fail"}
                    </span>
                  </td>
                  <td className="py-3">{formatScore(exec.qualityScore)}</td>
                  <td className="py-3 text-[hsl(var(--muted-foreground))]">{formatDuration(exec.durationMs)}</td>
                  <td className="py-3 max-w-[200px] truncate text-[hsl(var(--muted-foreground))]">{exec.input}</td>
                  <td className="py-3 max-w-[200px] truncate text-[hsl(var(--muted-foreground))]">{exec.output || exec.error || "—"}</td>
                  <td className="py-3 text-[hsl(var(--muted-foreground))] whitespace-nowrap">{new Date(exec.timestamp).toLocaleString()}</td>
                </motion.tr>
              ))}
              {data.rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                    No executions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Page {data.page} of {totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
