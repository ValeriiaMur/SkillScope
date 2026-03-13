# SkillScope — AI Agent Skill Evaluation Platform

**Agents that Trust** — Evaluate, score, and attest AI agent skill quality onchain on Base.

SkillScope is a drop-in SDK + web dashboard + onchain attestation tool that lets you evaluate how well AI agent skills (`.md` skill files) perform in real usage.

## Architecture

```
skillscope/
├── packages/
│   ├── sdk/          # @skillscope/sdk — npm package (TypeScript)
│   ├── shared/       # @skillscope/shared — types + utils
│   └── ui/           # @skillscope/ui — shared chart components
├── apps/
│   └── dashboard/    # Next.js 14 + Tailwind (App Router)
├── contracts/        # Foundry — SkillScopeAttestation.sol on Base
└── skills/           # Dog-fooding .claude skills
```

## Quick Start

### SDK Usage

```typescript
import { SkillScope } from "@skillscope/sdk";

const scope = new SkillScope({
  projectId: "my-project",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  dashboardUrl: "http://localhost:3333",
});

// Register a skill
scope.registerSkill("code-review", "./skills/code-review.md");

// Wrap and track executions
const reviewCode = scope.wrapSkill("code-review", async (input) => {
  // Your skill logic here
  return `Reviewed: ${input}`;
});

// Execute — automatically tracked, scored, and stored
const result = await reviewCode("Review this PR");

// Sync to dashboard
await scope.sync();

// Attest onchain
const attestation = await scope.attest("code-review");
console.log(`Attested: ${attestation.explorerUrl}`);

scope.close();
```

### Dashboard

```bash
cd apps/dashboard
pnpm dev
# Open http://localhost:3333
```

### Smart Contract

```bash
cd contracts
forge test    # Run tests
forge script script/Deploy.s.sol --rpc-url $BASE_RPC --broadcast  # Deploy
```

## Dashboard Pages

| Page | Route | Description |
|------|-------|-------------|
| Overview | `/` | KPIs, radar chart, trend line, recent executions |
| Skills | `/skills` | Sortable table with sparklines |
| Skill Detail | `/skills/[id]` | Trend lines, execution history, "Attest Onchain" |
| Compare | `/compare` | Side-by-side bars, overlaid radar |
| Executions | `/executions` | Paginated, filterable log |
| Attestations | `/attestations` | Tx hashes linked to BaseScan |
| Leaderboard | `/leaderboard` | Public, ranked by score + attestation proof |

## Tech Stack

- **SDK**: TypeScript, Drizzle ORM, better-sqlite3, Anthropic SDK, viem
- **Dashboard**: Next.js 14, Tailwind CSS, Recharts, Framer Motion, LibSQL
- **Contracts**: Solidity 0.8.24, Foundry, Base (Sepolia + Mainnet)
- **Monorepo**: pnpm workspaces, Turborepo

## Onchain

The `SkillScopeAttestation` contract stores:
- `skillFileHash` — SHA-256 of the skill file
- `skillName`, `score` (0-100), `executionCount`, `successCount`
- `erc8004AgentId` — optional ERC-8004 agent reputation link
- `attester` address and `timestamp`

Built for [The Synthesis](https://thesynthesis.ai) — onchain AI hackathon on Base.
