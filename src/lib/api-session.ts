import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function authenticatedDatabase() {
  const database = await createSupabaseServer();
  if (!database) return { response: Response.json({ ok: false, error: { code: "NOT_CONFIGURED", message: "Supabase is not configured" } }, { status: 503 }) };
  const { data: { user } } = await database.auth.getUser();
  if (!user) return { response: Response.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 }) };
  return { database, user };
}
