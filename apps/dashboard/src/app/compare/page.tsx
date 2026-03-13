import { getSkillsList } from "@/lib/queries";
import { CompareClient } from "./CompareClient";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const skills = await getSkillsList();
  return <CompareClient skills={skills} />;
}
