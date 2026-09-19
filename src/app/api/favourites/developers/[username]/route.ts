import { createSupabaseServer } from "@/lib/supabase/server";
import { usernameSchema } from "@/lib/validation";

export async function DELETE(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const database = await createSupabaseServer();
  if (!database) return Response.json({ ok: false, error: { code: "NOT_CONFIGURED", message: "Supabase is not configured" } }, { status: 503 });
  const { data: { user } } = await database.auth.getUser();
  if (!user) return Response.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Sign in to edit favourites" } }, { status: 401 });
  try {
    const username = usernameSchema.parse((await params).username);
    const { error } = await database.from("favorite_developers").delete().eq("user_id", user.id).eq("github_username", username);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: { code: "INVALID_REQUEST", message: "Could not remove this developer" } }, { status: 400 });
  }
}
