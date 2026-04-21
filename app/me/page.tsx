import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const u = await getServerUser();
  if (!u) redirect("/login");
  redirect(`/u/${u.handle}`);
}
