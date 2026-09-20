"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useFavourites } from "@/components/favourites-provider";

export function RemoveFavouriteButton({ endpoint, label, type, identifier }: { endpoint: string; label: string; type?: "developer" | "repository"; identifier?: string }) {
  const router = useRouter();
  const favourites = useFavourites();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function remove() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    const response = await fetch(endpoint, { method: "DELETE" });
    if (response.ok) { if (type && identifier) favourites?.setSaved(type, identifier, false); router.refresh(); }
    else setFailed(true);
    setBusy(false);
  }
return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label={`Remove ${label} from favourites`}
      className="btn btn-sm btn-danger shrink-0"
    >
      <X size={14} aria-hidden="true" />
      {busy ? "Removing…" : failed ? "Retry" : "Remove"}
    </button>
  );
}
