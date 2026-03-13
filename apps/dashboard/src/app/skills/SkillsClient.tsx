"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatScore } from "@skillscope/shared";
import { Sparkline } from "@skillscope/ui";

interface Props {
  skills: any[];
}

export function SkillsClient({ skills }: Props) {
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          All tracked agent skills and their performance
        </p>
      </motion.div>

      <div className="card mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Skill Name</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Executions</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Success Rate</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Avg Score</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Avg Duration</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Trend</th>
                <th className="pb-3 text-left font-medium text-[hsl(var(--muted-foreground))]">Attested</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill: any, idx: number) => {
                const successRate = skill.total_executions > 0
                  ? Math.round((skill.success_count / skill.total_executions) * 100)
                  : 0;

                return (
                  <motion.tr
                    key={skill.skill_name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--accent))]/50 transition-colors"
                  >
                    <td className="py-3">
                      <Link
                        href={`/skills/${encodeURIComponent(skill.skill_name)}`}
                        className="font-medium text-brand-400 hover:text-brand-300"
                      >
                        {skill.skill_name}
                      </Link>
                    </td>
                    <td className="py-3">{skill.total_executions}</td>
                    <td className="py-3">
                      <span className={successRate >= 80 ? "text-emerald-400" : successRate >= 50 ? "text-yellow-400" : "text-red-400"}>
                        {successRate}%
                      </span>
                    </td>
                    <td className="py-3 font-medium">{formatScore(skill.avg_score)}</td>
                    <td className="py-3 text-[hsl(var(--muted-foreground))]">{skill.avg_duration ? `${skill.avg_duration}ms` : "—"}</td>
                    <td className="py-3">
                      <Sparkline data={[65, 72, 68, 80, skill.avg_score || 70]} />
                    </td>
                    <td className="py-3">
                      {skill.attestation_count > 0 ? (
                        <span className="badge badge-attested">Verified</span>
                      ) : (
                        <span className="text-[hsl(var(--muted-foreground))]">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
              {skills.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                    No skills tracked yet. Sync data from the SDK to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
