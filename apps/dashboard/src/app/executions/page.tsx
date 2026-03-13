import { getAllExecutions } from "@/lib/queries";
import { ExecutionsClient } from "./ExecutionsClient";

export const dynamic = "force-dynamic";

export default async function ExecutionsPage() {
  const data = await getAllExecutions(1, 25);
  return <ExecutionsClient data={data} />;
}
