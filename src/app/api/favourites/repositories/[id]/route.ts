import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";

const idSchema = z.uuid();

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const database = await createSupabaseServer();
  if (!database) return Response.json({ ok: false, error: { code: "NOT_CONFIGURED", message: "Supabase is not configured" } }, { status: 503 });
  const { data: { user } } = await database.auth.getUser();
  if (!user) return Response.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Sign in to edit favourites" } }, { status: 401 });
  try {
    const id = idSchema.parse((await params).id);
    const { error } = await database.from("favorite_repositories").delete().eq("user_id", user.id).eq("id", id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: { code: "INVALID_REQUEST", message: "Could not remove this repository" } }, { status: 400 });
  }
}
