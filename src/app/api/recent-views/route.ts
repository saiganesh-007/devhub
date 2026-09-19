import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";

const viewSchema = z.object({
  entity_type: z.enum(["developer", "repository"]),
  entity_identifier: z.string().trim().min(1).max(180),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(request: Request) {
  const database = await createSupabaseServer();
  if (!database) return Response.json({ ok: false }, { status: 503 });
  const { data: { user } } = await database.auth.getUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  try {
    const body = viewSchema.parse(await request.json());
    const { error } = await database.from("recent_views").upsert(
      { ...body, user_id: user.id, viewed_at: new Date().toISOString() },
      { onConflict: "user_id,entity_type,entity_identifier" },
    );
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
