import { createServerClient } from "@supabase/ssr"; import { NextResponse,type NextRequest } from "next/server"; import { getSupabasePublicConfig } from "@/lib/supabase/config";
const privateRoutes=["/dashboard","/favourites","/settings"],authRoutes=["/login","/register"];
export async function proxy(request:NextRequest){const path=request.nextUrl.pathname,isPrivate=privateRoutes.some(route=>path===route||path.startsWith(`${route}/`)),config=getSupabasePublicConfig();let response=NextResponse.next({request});if(!config)return isPrivate?NextResponse.redirect(new URL("/login?error=not_configured",request.url)):response;
  const supabase=createServerClient(config.url,config.publicKey,{cookies:{getAll:()=>request.cookies.getAll(),setAll:(items)=>{items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});const claims=(await supabase.auth.getClaims()).data?.claims??null;if(isPrivate&&!claims)return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`,request.url));if(authRoutes.includes(path)&&claims)return NextResponse.redirect(new URL("/dashboard",request.url));return response}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]};


