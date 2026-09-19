import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";
export function createSupabaseBrowser(){const config=getSupabasePublicConfig();return config?createBrowserClient(config.url,config.publicKey):null}
