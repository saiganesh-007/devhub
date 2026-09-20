import { z } from "zod";
import { authenticatedDatabase } from "@/lib/api-session";

const schema = z.object({
  kind: z.enum(["search", "view", "comparison"]),
  entityType: z.enum(["developer", "repository"]).optional(),
  identifier: z.string().trim().min(1).max(180),
  secondaryIdentifier: z.string().trim().max(180).optional(),
  label: z.string().trim().max(180).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const session = await authenticatedDatabase(); if (session.response) return session.response;
  const { data, error } = await session.database.from("history_events").select("*").order("occurred_at", { ascending: false }).limit(20);
  return error ? Response.json({ ok: false, error: { code: "DATABASE_ERROR", message: "Could not load history" } }, { status: 500 }) : Response.json({ ok: true, data });
}

export async function POST(request: Request) {
  const session = await authenticatedDatabase(); if (session.response) return session.response;
  try {
    const body = schema.parse(await request.json());
    const row = { user_id: session.user.id, event_type: body.kind, entity_type: body.entityType ?? null, entity_identifier: body.identifier, secondary_identifier: body.secondaryIdentifier ?? null, label: body.label ?? null, metadata: body.metadata ?? {}, occurred_at: new Date().toISOString() };
    let duplicate = session.database.from("history_events").delete().eq("user_id", session.user.id).eq("event_type", body.kind).eq("entity_identifier", body.identifier);
    duplicate = body.entityType ? duplicate.eq("entity_type", body.entityType) : duplicate.is("entity_type", null);
    duplicate = body.secondaryIdentifier ? duplicate.eq("secondary_identifier", body.secondaryIdentifier) : duplicate.is("secondary_identifier", null);
    await duplicate;
    const { data, error } = await session.database.from("history_events").insert(row).select().single();
    if (error) throw error;
    const { data: overflow } = await session.database.from("history_events").select("id").eq("user_id", session.user.id).order("occurred_at", { ascending: false }).range(50, 200);
    if (overflow?.length) await session.database.from("history_events").delete().eq("user_id", session.user.id).in("id", overflow.map((item) => item.id));
    return Response.json({ ok: true, data });
  } catch { return Response.json({ ok: false, error: { code: "INVALID_REQUEST", message: "Invalid history event" } }, { status: 400 }); }
}

export async function DELETE() {
  const session = await authenticatedDatabase(); if (session.response) return session.response;
  const { error } = await session.database.from("history_events").delete().eq("user_id", session.user.id);
  return error ? Response.json({ ok: false, error: { code: "DATABASE_ERROR", message: "Could not clear history" } }, { status: 500 }) : Response.json({ ok: true });
}
