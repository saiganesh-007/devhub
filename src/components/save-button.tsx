"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavourites } from "@/components/favourites-provider";

export function SaveButton({
  kind,
  payload,
}: {
  kind: "developers" | "repositories";
  payload: Record<string, unknown>;
}) {
  const router = useRouter();
  const favourites = useFavourites();
  const identifier = useMemo(() => kind === "developers" ? String(payload.github_username) : String(payload.full_name), [kind, payload]);
  const entityType = kind === "developers" ? "developer" : "repository";
  const [operation, setOperation] = useState<"loading" | "error" | null>(null);
  const state = operation ?? (favourites?.isSaved(entityType, identifier) ? "saved" : "idle");

  async function toggle() {
    if (state === "loading") return;
    const wasSaved = state === "saved";
    setOperation("loading");
    try {
      const deleteId = kind === "developers" ? encodeURIComponent(identifier) : encodeURIComponent(String(payload.id ?? payload.github_repo_id));
      const response = await fetch(wasSaved ? `/api/favourites/${kind}/${deleteId}` : `/api/favourites/${kind}`, {
        method: wasSaved ? "DELETE" : "POST",
        headers: { "content-type": "application/json" },
        body: wasSaved ? undefined : JSON.stringify(payload),
      });
      if (response.status === 401) {
        const next = `${window.location.pathname}${window.location.search}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      if (!response.ok) throw new Error("Favourite update failed");
      favourites?.setSaved(entityType, identifier, !wasSaved);
      setOperation(null);
      router.refresh();
    } catch {
      setOperation("error");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={state === "loading"}
      aria-busy={state === "loading"}
      aria-label={
        state === "saved" ? "Remove from favourites" : "Save to favourites"
      }
      className={cn(
        "btn",
        state === "saved" && "btn-secondary",
        state === "error" && "btn-danger",
        state !== "saved" && state !== "error" && "btn-primary",
        state === "loading" && "btn-loading",
      )}
    >
      {state === "loading" ? (
        <LoaderCircle size={15} aria-hidden="true" className="animate-spin" />
      ) : state === "saved" ? (
        <Check size={15} aria-hidden="true" />
      ) : (
        <Heart size={15} aria-hidden="true" />
      )}
      {state === "loading"
        ? "Saving…"
        : state === "saved"
          ? "Saved"
          : state === "error"
            ? "Retry"
            : "Save"}
    </button>
  );
}
