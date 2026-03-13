"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
  color?: string;
}

export function KpiCard({ title, value, subtitle, trend, icon, color = "brand" }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn(
              "mt-1 text-sm",
              trend === "up" && "text-emerald-400",
              trend === "down" && "text-red-400",
              (!trend || trend === "neutral") && "text-[hsl(var(--muted-foreground))]"
            )}>
              {trend === "up" && "↑ "}
              {trend === "down" && "↓ "}
              {subtitle}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-brand-500/10 p-2.5">
          <svg className="h-5 w-5 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
