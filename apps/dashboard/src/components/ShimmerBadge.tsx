"use client";

interface ShimmerBadgeProps {
  children: React.ReactNode;
}

export function ShimmerBadge({ children }: ShimmerBadgeProps) {
  return (
    <span className="shimmer-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-cyan-400">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      {children}
    </span>
  );
}
