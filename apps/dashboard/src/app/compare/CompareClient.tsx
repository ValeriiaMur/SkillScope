"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ScoreBar, ScoreRadar } from "@skillscope/ui";

interface Props {
  skills: any[];
}

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
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Compare Skills</h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Side-by-side skill comparison
        </p>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-2">
        {skills.map((s: any) => (
          <button
            key={s.skill_name}
            onClick={() => toggle(s.skill_name)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              selected.includes(s.skill_name)
                ? "bg-brand-500 text-white"
                : "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            }`}
          >
            {s.skill_name}
          </button>
        ))}
      </div>

      {selected.length === 2 && skill1 && skill2 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-semibold">Score Comparison</h2>
            <div className="mt-4">
              <ScoreBar data={barData} />
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold">Radar Comparison</h2>
            <div className="mt-4">
              <ScoreRadar data={radarData} compareData={compareRadar} />
            </div>
          </div>
        </div>
      )}

      {selected.length < 2 && (
        <div className="card mt-8 flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
          Select two skills to compare
        </div>
      )}
    </div>
  );
}
