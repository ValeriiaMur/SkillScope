import { getOverviewStats, getRecentExecutions, getSkillsList } from "@/lib/queries";
import { OverviewClient } from "./OverviewClient";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [stats, recentExecs, skillsList] = await Promise.all([
    getOverviewStats(),
    getRecentExecutions(10),
    getSkillsList(),
  ]);

  return <OverviewClient stats={stats} recentExecs={recentExecs} skills={skillsList} />;
}
