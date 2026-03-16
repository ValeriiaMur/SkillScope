"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
  delay?: number;
}

export function KpiCard({ title, value, subtitle, trend, icon, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 30 }}
      className="glass-card glass-card-glow"
    >
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{title}</p>
          <p className="mt-3 text-3xl font-bold font-display tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn(
              "mt-1.5 text-sm font-medium",
              trend === "up" && "text-emerald-400",
              trend === "down" && "text-red-400",
              (!trend || trend === "neutral") && "text-[hsl(var(--muted-foreground))]"
            )}>
              {trend === "up" && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {subtitle}
                </span>
              )}
              {trend === "down" && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {subtitle}
                </span>
              )}
              {(!trend || trend === "neutral") && subtitle}
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient shadow-lg shadow-brand-500/20">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
