import { getSkillsList } from "@/lib/queries";
import { SkillsClient } from "./SkillsClient";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await getSkillsList();
  return <SkillsClient skills={skills} />;
}
