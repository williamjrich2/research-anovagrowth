import { getServerUser } from "./session";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
const ADMIN_UIDS = (process.env.ADMIN_UIDS || "").split(",").map((e) => e.trim());

export async function isAdmin(): Promise<boolean> {
  const user = await getServerUser();
  if (!user) return false;
  const email = user.email?.toLowerCase();
  if (email && ADMIN_EMAILS.includes(email)) return true;
  if (ADMIN_UIDS.includes(user.uid)) return true;
  return false;
}
