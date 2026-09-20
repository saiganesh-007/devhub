import { z } from "zod";
import { authenticatedDatabase } from "@/lib/api-session";

const schema = z.object({ name: z.string().trim().min(1).max(80) });

export async function GET() {
  const session = await authenticatedDatabase(); if (session.response) return session.response;
  const { data, error } = await session.database.from("collections").select("*, collection_items(*)").order("updated_at", { ascending: false });
  return error ? Response.json({ ok: false, error: { code: "DATABASE_ERROR", message: "Could not load collections" } }, { status: 500 }) : Response.json({ ok: true, data });
}

export async function POST(request: Request) {
  const session = await authenticatedDatabase(); if (session.response) return session.response;
  try {
    const body = schema.parse(await request.json());
    const { data, error } = await session.database.from("collections").insert({ ...body, user_id: session.user.id }).select().single();
    if (error) throw error;
    return Response.json({ ok: true, data }, { status: 201 });
  } catch { return Response.json({ ok: false, error: { code: "INVALID_REQUEST", message: "Collection names must be unique and 1–80 characters" } }, { status: 400 }); }
}
