"use client";
import { motion } from "framer-motion";

interface Props {
  attestations: any[];
}

export function AttestationsClient({ attestations }: Props) {
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Attestations</h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Onchain skill quality proofs on Base
        </p>
      </motion.div>

      <div className="mt-8 grid gap-4">
        {attestations.map((att: any, idx: number) => (
          <motion.div
            key={att.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10">
                <svg className="h-6 w-6 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">{att.skillName}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Score: {att.score} | {att.executionCount} executions | {att.successCount} successes
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5 px-3 py-1.5 text-sm font-medium text-brand-400 hover:bg-brand-500/10 transition-colors"
              >
                <span className="font-mono">{att.txHash.slice(0, 10)}...{att.txHash.slice(-6)}</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              {att.blockNumber && (
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Block #{att.blockNumber}</p>
              )}
            </div>
          </motion.div>
        ))}
        {attestations.length === 0 && (
          <div className="card flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
            No attestations yet. Attest a skill from the skill detail page.
          </div>
        )}
      </div>
    </div>
  );
}
