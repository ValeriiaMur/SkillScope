"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/skills", label: "Skills", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/executions", label: "Executions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/compare", label: "Compare", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/attestations", label: "Attestations", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { href: "/leaderboard", label: "Leaderboard", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[hsla(240,5%,18%,0.5)] bg-[hsla(240,10%,4%,0.85)] backdrop-blur-xl">
      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

      <div className="relative flex h-16 items-center gap-3 border-b border-[hsla(240,5%,18%,0.5)] px-6">
        <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/20">
          <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-lg font-display font-bold tracking-tight gradient-text">SkillScope</span>
      </div>

      <nav className="relative mt-6 space-y-1 px-3">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-500/10 text-white shadow-sm"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsla(240,5%,14%,0.5)] hover:text-white"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                isActive
                  ? "bg-brand-gradient shadow-md shadow-brand-500/25"
                  : "bg-[hsla(240,5%,14%,0.5)] group-hover:bg-[hsla(240,5%,18%,0.5)]"
              )}>
                <svg className={cn("h-4 w-4", isActive ? "text-white" : "text-[hsl(var(--muted-foreground))] group-hover:text-white")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-[hsla(240,5%,18%,0.5)] p-4">
        <div className="relative overflow-hidden rounded-xl bg-brand-gradient p-[1px]">
          <div className="rounded-[11px] bg-[hsl(240,10%,5%)] p-3.5">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 animate-glow-pulse" />
              <p className="text-xs font-semibold text-white">Onchain Verified</p>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))]">
              Agents that Trust — powered by Base
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
