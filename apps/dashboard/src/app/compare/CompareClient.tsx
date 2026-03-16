"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ScoreBar, ScoreRadar } from "@skillscope/ui";

interface Props {
  skills: any[];
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } };

export function CompareClient({ skills }: Props) {
  const [selected, setSelected] = useState<string[]>(
    skills.slice(0, 2).map((s: any) => s.skill_name)
  );

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : prev.length < 2
        ? [...prev, name]
        : [prev[1], name]
    );
  };

  const skill1 = skills.find((s: any) => s.skill_name === selected[0]);
  const skill2 = skills.find((s: any) => s.skill_name === selected[1]);

  const barData =
    skill1 && skill2
      ? [
          { name: "Avg Score", primary: skill1.avg_score || 0, compare: skill2.avg_score || 0 },
          {
            name: "Success Rate",
            primary: skill1.total_executions > 0 ? Math.round((skill1.success_count / skill1.total_executions) * 100) : 0,
            compare: skill2.total_executions > 0 ? Math.round((skill2.success_count / skill2.total_executions) * 100) : 0,
          },
        ]
      : [];

  const radarMetrics = ["Score", "Success Rate", "Consistency", "Speed"];
  const radarData = radarMetrics.map((m, i) => ({
    metric: m,
    value: skill1 ? [skill1.avg_score || 0, skill1.total_executions > 0 ? (skill1.success_count / skill1.total_executions) * 100 : 0, 70, 80][i] : 0,
  }));
  const compareRadar = radarMetrics.map((m, i) => ({
    metric: m,
    value: skill2 ? [skill2.avg_score || 0, skill2.total_executions > 0 ? (skill2.success_count / skill2.total_executions) * 100 : 0, 65, 75][i] : 0,
  }));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold font-display tracking-tight">Compare Skills</h1>
        <p className="mt-1.5 text-[hsl(var(--muted-foreground))]">
          Side-by-side skill performance comparison
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
        {skills.map((s: any) => (
          <button
            key={s.skill_name}
            onClick={() => toggle(s.skill_name)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              selected.includes(s.skill_name)
                ? "btn-gradient shadow-lg shadow-brand-500/20"
                : "border border-[hsla(240,5%,18%,0.5)] bg-[hsla(240,6%,8%,0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsla(240,5%,14%,0.5)] hover:text-white"
            }`}
          >
            {s.skill_name}
          </button>
        ))}
      </motion.div>

      {selected.length === 2 && skill1 && skill2 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <motion.div variants={fadeUp} className="glass-card glass-card-glow">
            <h2 className="text-lg font-semibold font-display">Score Comparison</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              <span className="gradient-text font-semibold">{selected[0]}</span> vs <span className="gradient-text font-semibold">{selected[1]}</span>
            </p>
            <div className="mt-4">
              <ScoreBar data={barData} />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card glass-card-glow">
            <h2 className="text-lg font-semibold font-display">Radar Comparison</h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Multi-dimensional analysis</p>
            <div className="mt-4">
              <ScoreRadar data={radarData} compareData={compareRadar} />
            </div>
          </motion.div>
        </div>
      )}

      {selected.length < 2 && (
        <motion.div variants={fadeUp} className="glass-card mt-8 flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))]/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-3">Select two skills to compare</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
