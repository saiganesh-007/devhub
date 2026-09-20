import { z } from "zod"; import { GitHubError } from "./client"; import { githubErrorCode } from "./errors";
export function apiError(error:unknown){
  if(error instanceof GitHubError) return Response.json({ok:false,error:{code:githubErrorCode(error.status,error.rateLimit?.remaining),message:error.message,rateLimit:error.rateLimit}},{status:error.status});
  if(error instanceof z.ZodError) return Response.json({ok:false,error:{code:"INVALID_REQUEST",message:error.issues[0]?.message||"Invalid request"}},{status:400});
  return Response.json({ok:false,error:{code:"INTERNAL_ERROR",message:"Unexpected server error"}},{status:500});
}
export const apiData=<T>(data:T)=>Response.json({ok:true,data});

