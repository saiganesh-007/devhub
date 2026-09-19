"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SaveButton({
  kind,
  payload,
}: {
  kind: "developers" | "repositories";
  payload: Record<string, unknown>;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "saved" | "error">(
    "idle",
  );

  async function save() {
    if (state === "loading" || state === "saved") return;
    setState("loading");
    const response = await fetch(`/api/favourites/${kind}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 401) {
      router.push("/login");
      return;
    }
    setState(response.ok ? "saved" : "error");
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={state === "loading" || state === "saved"}
      aria-busy={state === "loading"}
      aria-label={
        state === "saved" ? "Saved to favourites" : "Save to favourites"
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
