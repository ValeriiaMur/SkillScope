/**
 * Dog-fooding: Track a REAL Claude skill execution through SkillScope.
 *
 * Reads actual .md skill files from the local machine, registers them with
 * SkillScope, wraps a Claude API call that uses the skill as a system prompt,
 * executes it, auto-scores the output, and syncs to the dashboard.
 *
 * Run: ANTHROPIC_API_KEY=sk-... npx tsx scripts/dogfood.ts
 */
import { SkillScope } from "@skillscope/sdk";
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://localhost:3000";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY is required");
  process.exit(1);
}

// Skill files to dog-food — real .md skills on this machine
const SKILL_FILES: { name: string; path: string }[] = [
  {
    name: "frontend-design",
    path: path.join(
      process.env.HOME || "~",
      ".agents/skills/frontend-design/SKILL.md"
    ),
  },
];

// Find additional skills dynamically
const skillsDir = path.join(process.env.HOME || "~", ".agents/skills");
if (fs.existsSync(skillsDir)) {
  for (const dir of fs.readdirSync(skillsDir)) {
    const skillPath = path.join(skillsDir, dir, "SKILL.md");
    if (
      fs.existsSync(skillPath) &&
      !SKILL_FILES.some((s) => s.name === dir)
    ) {
      SKILL_FILES.push({ name: dir, path: skillPath });
    }
  }
}

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  SkillScope Dog-Fooding");
  console.log("  Real Claude skill calls tracked by our own SDK");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const scope = new SkillScope({
    projectId: "dogfood",
    projectName: "SkillScope Dogfood",
    dashboardUrl: DASHBOARD_URL,
    anthropicApiKey: ANTHROPIC_API_KEY,
    contractAddress: CONTRACT_ADDRESS,
    privateKey: PRIVATE_KEY,
    rpcUrl: "https://sepolia.base.org",
    autoScore: true,
  });

  // Register real skill files
  console.log(`[1/4] Found ${SKILL_FILES.length} skill files:\n`);
  for (const skill of SKILL_FILES) {
    if (fs.existsSync(skill.path)) {
      const hash = scope.registerSkill(skill.name, skill.path, `Real skill: ${skill.name}`);
      const size = fs.statSync(skill.path).size;
      console.log(`  ✓ ${skill.name} (${(size / 1024).toFixed(1)}KB, hash: ${hash.slice(0, 12)}...)`);
    } else {
      console.log(`  ✗ ${skill.name} — file not found: ${skill.path}`);
    }
  }

  // Wrap each skill with a real Claude API call
  console.log("\n[2/4] Executing real Claude API calls...\n");

  const testCases: { skill: string; input: string }[] = [
    {
      skill: "frontend-design",
      input: "Create a minimal, elegant 404 page component using React and Tailwind CSS. It should have a large '404' heading, a brief message, and a button to go home.",
    },
  ];

  // Add more test cases for discovered skills
  for (const skill of SKILL_FILES) {
    if (skill.name === "frontend-design") continue;
    if (skill.name === "vercel-react-best-practices") {
      testCases.push({
        skill: skill.name,
        input: "Review this React component for performance issues:\n\n```tsx\nexport function UserList({ users }) {\n  const sorted = users.sort((a, b) => a.name.localeCompare(b.name));\n  return <ul>{sorted.map(u => <li key={u.id} onClick={() => alert(u.name)}>{u.name}</li>)}</ul>;\n}\n```",
      });
    } else if (skill.name === "web-design-guidelines") {
      testCases.push({
        skill: skill.name,
        input: "Review the accessibility of a login form that has email/password fields with placeholder text but no visible labels, and a submit button that says 'Go'.",
      });
    }
  }

  for (const tc of testCases) {
    const skillFile = SKILL_FILES.find((s) => s.name === tc.skill);
    if (!skillFile || !fs.existsSync(skillFile.path)) continue;

    const skillContent = fs.readFileSync(skillFile.path, "utf-8");

    const wrappedFn = scope.wrapSkill(tc.skill, async (input: string) => {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: skillContent,
        messages: [{ role: "user", content: input }],
      });

      const text = response.content
        .filter((c): c is Anthropic.TextBlock => c.type === "text")
        .map((c) => c.text)
        .join("\n");

      return text;
    });

    try {
      console.log(`  → ${tc.skill}: "${tc.input.slice(0, 60)}..."`);
      const result = await wrappedFn(tc.input);
      console.log(`    ✓ Got ${result.length} chars of output`);
      console.log(`    Preview: ${result.slice(0, 100).replace(/\n/g, " ")}...\n`);
    } catch (err: any) {
      console.log(`    ✗ Failed: ${err.message}\n`);
    }
  }

  // Print stats
  console.log("[3/4] Skill stats:\n");
  for (const skill of SKILL_FILES) {
    const stats = scope.getSkillStats(skill.name);
    if (stats) {
      console.log(`  ${skill.name}:`);
      console.log(`    Executions: ${stats.totalExecutions} (${stats.successCount} success)`);
      console.log(`    Avg Score:  ${stats.avgQualityScore?.toFixed(1) ?? "N/A"}`);
      console.log(`    Avg Time:   ${stats.avgDurationMs}ms`);
    }
  }

  // Sync to dashboard
  console.log("\n[4/4] Syncing to dashboard...");
  try {
    const syncResult = await scope.sync();
    console.log(`  ✓ Synced ${syncResult.received} executions`);
  } catch (err: any) {
    console.log(`  ✗ Sync failed: ${err.message}`);
    console.log(`  (Make sure dashboard is running at ${DASHBOARD_URL})`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Dog-fooding complete!");
  console.log(`  Dashboard: ${DASHBOARD_URL}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  scope.close();
}

main().catch(console.error);
