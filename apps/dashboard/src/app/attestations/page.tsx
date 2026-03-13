import { getAllAttestations } from "@/lib/queries";
import { AttestationsClient } from "./AttestationsClient";

export const dynamic = "force-dynamic";

export default async function AttestationsPage() {
  const attestations = await getAllAttestations();
  return <AttestationsClient attestations={attestations} />;
}
