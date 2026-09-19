"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function RemoveFavouriteButton({ endpoint, label }: { endpoint: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function remove() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    const response = await fetch(endpoint, { method: "DELETE" });
    if (response.ok) router.refresh();
    else setFailed(true);
    setBusy(false);
  }
  return <button type="button" onClick={remove} disabled={busy} aria-label={`Remove ${label} from favourites`} className="collection-remove">
    <X size={14} aria-hidden="true" />{busy ? "Removing…" : failed ? "Retry" : "Remove"}
  </button>;
}
