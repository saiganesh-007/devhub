import { createSupabaseServer } from "@/lib/supabase/server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const database = await createSupabaseServer();
  if (!database) return Response.json({ ok: false, error: { code: "NOT_CONFIGURED", message: "Supabase is not configured" } }, { status: 503 });
  const { data: { user } } = await database.auth.getUser();
  if (!user) return Response.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Sign in to edit favourites" } }, { status: 401 });
  try {
    const id = decodeURIComponent((await params).id);
    const numericId = Number(id);
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (!uuid && (!Number.isSafeInteger(numericId) || numericId <= 0)) throw new Error("Invalid repository id");
    let query = database.from("favorite_repositories").delete().eq("user_id", user.id);
    query = uuid ? query.eq("id", id) : query.eq("github_repo_id", numericId);
    const { error } = await query;
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: { code: "INVALID_REQUEST", message: "Could not remove this repository" } }, { status: 400 });
  }
}
