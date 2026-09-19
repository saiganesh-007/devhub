import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "./config";
export async function createSupabaseServer(){
  const store=await cookies(),config=getSupabasePublicConfig();
  if(!config)return null;
  return createServerClient(config.url,config.publicKey,{cookies:{getAll:()=>store.getAll(),setAll:(items)=>{try{items.forEach(({name,value,options})=>store.set(name,value,options));}catch{}}}});
}
