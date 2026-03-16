"use client";
import { motion } from "framer-motion";
import { ShimmerBadge } from "@/components/ShimmerBadge";

interface Props {
  attestations: any[];
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } };

export function AttestationsClient({ attestations }: Props) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold font-display tracking-tight">Attestations</h1>
          {attestations.length > 0 && <ShimmerBadge>{attestations.length} Onchain</ShimmerBadge>}
        </div>
        <p className="mt-1.5 text-[hsl(var(--muted-foreground))]">
          Onchain skill quality proofs — verified on Base
        </p>
      </motion.div>

      <div className="mt-8 grid gap-4">
        {attestations.map((att: any, idx: number) => (
          <motion.div
            key={att.id}
            variants={fadeUp}
            className="glass-card glass-card-glow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient shadow-lg shadow-brand-500/20">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold font-display">{att.skillName}</p>
                  <ShimmerBadge>Verified</ShimmerBadge>
                </div>
                <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                  Score: <span className="font-mono text-white">{att.score}</span> | {att.executionCount} executions | {att.successCount} successes
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {new Date(att.timestamp).toLocaleString()} | {att.chain}
                </p>
              </div>
            </div>
            <div className="text-right">
              <a
                href={`https://${att.chain === "base" ? "" : "sepolia."}basescan.org/tx/${att.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gradient inline-flex items-center gap-1.5 text-sm"
              >
                <span className="font-mono">{att.txHash.slice(0, 10)}...{att.txHash.slice(-6)}</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              {att.blockNumber && (
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Block <span className="font-mono">#{att.blockNumber}</span></p>
              )}
            </div>
          </motion.div>
        ))}
        {attestations.length === 0 && (
          <motion.div variants={fadeUp} className="glass-card flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
            <div className="text-center">
              <svg className="mx-auto h-10 w-10 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="mt-3">No attestations yet. Attest a skill from the skill detail page.</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
