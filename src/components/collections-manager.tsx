"use client";

import { useEffect, useState } from "react";
import { Folder, Plus, Trash2 } from "lucide-react";

type Collection = { id: string; name: string; collection_items?: unknown[] };

export function CollectionsManager() {
  const [items, setItems] = useState<Collection[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const load = () => fetch("/api/collections").then((r) => r.ok ? r.json() : null).then((body) => setItems(body?.data ?? []));
  useEffect(() => { void load(); }, []);
  async function create() { const value = name.trim(); if (!value) return; setError(""); const response = await fetch("/api/collections", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: value }) }); if (!response.ok) { setError("Use a unique name up to 80 characters."); return; } setName(""); await load(); }
  async function remove(id: string) { await fetch(`/api/collections/${id}`, { method: "DELETE" }); setItems((current) => current.filter((item) => item.id !== id)); }
  return <section className="mt-10" aria-labelledby="collections-heading"><div className="mb-5 flex items-center justify-between border-b border-line pb-4"><h2 id="collections-heading" className="text-section-title">Collections</h2><span className="text-technical">{items.length.toString().padStart(2, "0")}</span></div>
    <div className="flex gap-2"><input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void create(); }} maxLength={80} placeholder="New collection name" className="min-w-0 flex-1 rounded-xl border border-line bg-panel px-3 text-sm text-ink outline-none focus:border-brand1" /><button className="btn btn-primary" type="button" onClick={create}><Plus size={15} />Create</button></div>
    {error && <p role="alert" className="mt-2 text-xs text-err">{error}</p>}
    <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <li key={item.id} className="card-surface flex items-center gap-3 p-4"><Folder size={17} className="text-brand2" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-ink">{item.name}</strong><small className="text-ink3">{item.collection_items?.length ?? 0} items</small></span><button type="button" className="btn-icon" aria-label={`Delete ${item.name}`} onClick={() => remove(item.id)}><Trash2 size={14} /></button></li>)}</ul>
  </section>;
}
