/**
 * E2E Demo: SDK → Score → Sync → Dashboard → Attest → BaseScan
 *
 * Run: npx tsx scripts/e2e-demo.ts
 *
 * Prerequisites:
 *   1. Dashboard running at http://localhost:3333 (pnpm --filter dashboard dev)
 *   2. Set env vars: ANTHROPIC_API_KEY, CONTRACT_ADDRESS, PRIVATE_KEY
 */
import { SkillScope } from "@skillscope/sdk";
import path from "node:path";

const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://localhost:3333";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  SkillScope E2E Demo");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 1. Initialize SDK
  const scope = new SkillScope({
    projectId: "e2e-demo",
    projectName: "SkillScope E2E Demo",
    dashboardUrl: DASHBOARD_URL,
    anthropicApiKey: ANTHROPIC_API_KEY,
    contractAddress: CONTRACT_ADDRESS,
    privateKey: PRIVATE_KEY,
    rpcUrl: "https://sepolia.base.org",
    autoScore: !!ANTHROPIC_API_KEY,
  });
  console.log("[1/6] SDK initialized (project: e2e-demo)\n");

  // 2. Register skills
  const skills = [
    { name: "code-review", content: "# Code Review Skill\n\nReview code for bugs, security issues, and best practices. Provide actionable feedback with severity levels." },
    { name: "summarizer", content: "# Summarizer Skill\n\nSummarize long documents into concise bullet points preserving key information and nuance." },
    { name: "test-writer", content: "# Test Writer Skill\n\nGenerate comprehensive unit tests for functions. Cover edge cases, error paths, and happy paths." },
  ];

  for (const s of skills) {
    await scope.registerSkill(s.name, s.content, `Demo skill: ${s.name}`);
  }
  console.log(`[2/6] Registered ${skills.length} skills: ${skills.map(s => s.name).join(", ")}\n`);

  // 3. Execute skills with wrapping
  const codeReview = scope.wrapSkill("code-review", async (input: string) => {
    // Simulate a code review
    return `## Code Review\n\n**File:** ${input}\n\n### Issues Found\n1. **Medium** - Missing null check on line 42\n2. **Low** - Variable \`x\` should be renamed to something more descriptive\n3. **Info** - Consider using optional chaining\n\n### Summary\nOverall code quality is good. 2 issues to address before merge.`;
  });

  const summarizer = scope.wrapSkill("summarizer", async (input: string) => {
    return `## Summary\n\n- ${input.split(".").filter(Boolean).slice(0, 3).map(s => s.trim()).join("\n- ")}\n\n**Key takeaway:** The document covers important aspects that should be reviewed.`;
  });

  const testWriter = scope.wrapSkill("test-writer", async (input: string) => {
    return `import { describe, it, expect } from "vitest";\nimport { ${input} } from "./module";\n\ndescribe("${input}", () => {\n  it("should handle valid input", () => {\n    expect(${input}("test")).toBeDefined();\n  });\n  it("should handle empty input", () => {\n    expect(${input}("")).toBe("");\n  });\n  it("should throw on null", () => {\n    expect(() => ${input}(null as any)).toThrow();\n  });\n});`;
  });

  console.log("[3/6] Executing skills...\n");

  const executions = [
    { fn: codeReview, input: "src/components/UserProfile.tsx", skill: "code-review" },
    { fn: codeReview, input: "src/lib/auth.ts", skill: "code-review" },
    { fn: summarizer, input: "The SkillScope SDK enables tracking AI agent skill quality. It provides automatic scoring via Claude API. Attestations are stored onchain on Base for verifiability.", skill: "summarizer" },
    { fn: summarizer, input: "Web3 attestations provide cryptographic proof of data integrity. EAS on Base enables lightweight attestation schemas. Smart contracts store immutable records.", skill: "summarizer" },
    { fn: testWriter, input: "formatScore", skill: "test-writer" },
    { fn: testWriter, input: "hashContent", skill: "test-writer" },
  ];

  for (const exec of executions) {
    try {
      const result = await exec.fn(exec.input);
      console.log(`  ✓ ${exec.skill}: "${exec.input.slice(0, 40)}..." → ${result.length} chars`);
    } catch (err: any) {
      console.log(`  ✗ ${exec.skill}: ${err.message}`);
    }
  }

  // Get stats
  console.log("\n  Skill Stats:");
  for (const s of skills) {
    const stats = scope.getSkillStats(s.name);
    if (stats) {
      console.log(`    ${s.name}: ${stats.totalExecutions} execs, ${stats.successCount} success, avg score: ${stats.avgQualityScore?.toFixed(1) ?? "N/A"}`);
    }
  }

  // 4. Sync to dashboard
  console.log("\n[4/6] Syncing to dashboard...");
  try {
    const syncResult = await scope.sync();
    console.log(`  ✓ Synced ${syncResult.received} executions to ${DASHBOARD_URL}`);
    if (syncResult.errors.length > 0) {
      console.log(`  ⚠ Errors: ${syncResult.errors.join(", ")}`);
    }
  } catch (err: any) {
    console.log(`  ✗ Sync failed: ${err.message}`);
    console.log(`  (Make sure dashboard is running at ${DASHBOARD_URL})\n`);
  }

  // 5. Attest onchain (if configured)
  console.log("\n[5/6] Onchain attestation...");
  if (CONTRACT_ADDRESS && PRIVATE_KEY) {
    try {
      const attestResult = await scope.attest("code-review");
      console.log(`  ✓ Attested "code-review" onchain!`);
      console.log(`    TX: ${attestResult.explorerUrl}`);
      console.log(`    Block: ${attestResult.blockNumber}`);
    } catch (err: any) {
      console.log(`  ✗ Attestation failed: ${err.message}`);
    }
  } else {
    console.log("  ⏭ Skipped (CONTRACT_ADDRESS and PRIVATE_KEY not set)");
  }

  // 6. Summary
  console.log("\n[6/6] E2E Demo Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Dashboard: ${DASHBOARD_URL}`);
  console.log(`  Skills:    ${skills.length}`);
  console.log(`  Executions: ${executions.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  scope.close();
}

main().catch(console.error);
