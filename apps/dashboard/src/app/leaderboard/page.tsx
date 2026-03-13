import { getLeaderboard } from "@/lib/queries";
import { LeaderboardClient } from "./LeaderboardClient";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();
  return <LeaderboardClient leaderboard={leaderboard} />;
}
