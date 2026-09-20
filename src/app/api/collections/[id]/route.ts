import { z } from "zod";
import { authenticatedDatabase } from "@/lib/api-session";
const idSchema = z.uuid();
const nameSchema = z.object({ name: z.string().trim().min(1).max(80) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await authenticatedDatabase(); if (session.response) return session.response;
  try { const id = idSchema.parse((await params).id); const body = nameSchema.parse(await request.json()); const { data, error } = await session.database.from("collections").update({ ...body, updated_at: new Date().toISOString() }).eq("user_id", session.user.id).eq("id", id).select().single(); if (error) throw error; return Response.json({ ok: true, data }); }
  catch { return Response.json({ ok: false, error: { code: "INVALID_REQUEST", message: "Could not rename collection" } }, { status: 400 }); }
}
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await authenticatedDatabase(); if (session.response) return session.response;
  try { const id = idSchema.parse((await params).id); const { error } = await session.database.from("collections").delete().eq("user_id", session.user.id).eq("id", id); if (error) throw error; return Response.json({ ok: true }); }
  catch { return Response.json({ ok: false, error: { code: "INVALID_REQUEST", message: "Could not delete collection" } }, { status: 400 }); }
}
