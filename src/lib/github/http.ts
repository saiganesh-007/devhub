import { GitHubError } from "./client";
export function apiError(error:unknown){
  if(error instanceof GitHubError) return Response.json({ok:false,error:{code:error.status===403?"RATE_LIMITED":error.status===404?"NOT_FOUND":"GITHUB_ERROR",message:error.message,rateLimit:error.rateLimit}},{status:error.status});
  return Response.json({ok:false,error:{code:"INTERNAL_ERROR",message:"Unexpected server error"}},{status:500});
}
export const apiData=<T>(data:T)=>Response.json({ok:true,data});

