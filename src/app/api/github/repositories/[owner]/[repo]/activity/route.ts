import { getActivity } from "@/lib/github/client";
import { apiData, apiError } from "@/lib/github/http";
import { repoPartSchema } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  try {
    const values = await params;
    return apiData(await getActivity(repoPartSchema.parse(values.owner), repoPartSchema.parse(values.repo)));
  } catch (error) {
    return apiError(error);
  }
}
