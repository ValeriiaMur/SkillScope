import { getSkillDetail, getScoreTrend } from "@/lib/queries";
import { SkillDetailClient } from "./SkillDetailClient";

export const dynamic = "force-dynamic";

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skillName = decodeURIComponent(id);
  const [detail, trend] = await Promise.all([
    getSkillDetail(skillName),
    getScoreTrend(skillName),
  ]);

  return <SkillDetailClient skillName={skillName} detail={detail} trend={trend} />;
}
