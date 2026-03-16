"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatScore } from "@skillscope/shared";
import { Sparkline } from "@skillscope/ui";
import { ShimmerBadge } from "@/components/ShimmerBadge";

interface Props {
  skills: any[];
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } };

export function SkillsClient({ skills }: Props) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold font-display tracking-tight">Skills</h1>
        <p className="mt-1.5 text-[hsl(var(--muted-foreground))]">
          All tracked agent skills and their performance
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card mt-8">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Executions</th>
                <th>Success Rate</th>
                <th>Avg Score</th>
                <th>Avg Duration</th>
                <th>Trend</th>
                <th>Status</th>
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <td>
                      <Link
                        href={`/skills/${encodeURIComponent(skill.skill_name)}`}
                        className="font-semibold gradient-text hover:opacity-80 transition-opacity"
                      >
                        {skill.skill_name}
                      </Link>
                    </td>
                    <td className="font-mono">{skill.total_executions}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-[hsla(240,5%,18%,0.5)]">
                          <div
                            className={`h-full rounded-full ${
                              successRate >= 80 ? "bg-emerald-400" : successRate >= 50 ? "bg-yellow-400" : "bg-red-400"
                            }`}
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{successRate}%</span>
                      </div>
                    </td>
                    <td className="font-semibold font-mono">{formatScore(skill.avg_score)}</td>
                    <td className="text-[hsl(var(--muted-foreground))] font-mono">{skill.avg_duration ? `${skill.avg_duration}ms` : "—"}</td>
                    <td>
                      <Sparkline data={[65, 72, 68, 80, skill.avg_score || 70]} color="#8b5cf6" />
                    </td>
                    <td>
                      {skill.attestation_count > 0 ? (
                        <ShimmerBadge>Verified</ShimmerBadge>
                      ) : (
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">Unverified</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
              {skills.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[hsl(var(--muted-foreground))]">
                    No skills tracked yet. Sync data from the SDK to get started.
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
