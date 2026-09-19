"use server"; import { redirect } from "next/navigation"; import { createSupabaseServer } from "@/lib/supabase/server";
export async function logout(){const supabase=await createSupabaseServer();if(supabase)await supabase.auth.signOut();redirect("/login")}
