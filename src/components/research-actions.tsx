"use client";

import { useEffect, useState } from "react";
import {
  FolderPlus,
  LoaderCircle,
  NotebookPen,
} from "lucide-react";
import type { EntityType } from "@/lib/workspace";

type Collection = {
  id: string;
  name: string;
  collection_items?: Array<{
    entity_type: EntityType;
    entity_identifier: string;
  }>;
};

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException &&
      error.name === "AbortError") ||
    (error instanceof Error &&
      error.name === "AbortError")
  );
}

export function ResearchActions({
  type,
  identifier,
}: {
  type: EntityType;
  identifier: string;
}) {
  const [collections, setCollections] = useState<
    Collection[]
  >([]);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadResearchData() {
      try {
        const [
          collectionsResponse,
          noteResponse,
        ] = await Promise.all([
          fetch("/api/collections"),

          fetch(
            `/api/notes?type=${encodeURIComponent(
              type
            )}&id=${encodeURIComponent(identifier)}`
          ),
        ]);

        const collectionsData =
          collectionsResponse.ok
            ? await collectionsResponse.json()
            : null;

        const noteData =
          noteResponse.ok
            ? await noteResponse.json()
            : null;

        if (cancelled) {
          return;
        }

        setCollections(
          collectionsData?.data ?? []
        );

        setNote(
          noteData?.data?.note ?? ""
        );
      } catch (error) {
        if (cancelled || isAbortError(error)) {
          return;
        }

        console.error(
          "Failed to load research data:",
          error
        );
      }
    }

    void loadResearchData();

    return () => {
      cancelled = true;
    };
  }, [identifier, type]);

  async function saveNote() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/notes",
        {
          method: "PUT",
          headers: {
            "content-type":
              "application/json",
          },
          body: JSON.stringify({
            entity_type: type,
            entity_identifier:
              identifier,
            note,
          }),
        }
      );

      setMessage(
        response.ok
          ? "Note saved"
          : "Could not save note"
      );
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      setMessage(
        "Could not save note"
      );
    } finally {
      setSaving(false);
    }
  }

  async function addToCollection(
    id: string
  ) {
    setMessage("");

    try {
      const response = await fetch(
        `/api/collections/${id}/items`,
        {
          method: "POST",
          headers: {
            "content-type":
              "application/json",
          },
          body: JSON.stringify({
            entity_type: type,
            entity_identifier:
              identifier,
          }),
        }
      );

      setMessage(
        response.ok
          ? "Added to collection"
          : "Save this item first or retry"
      );
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      setMessage(
        "Could not add to collection"
      );
    }
  }

  return (
    <details className="mt-5 rounded-xl border border-line bg-panel/40 p-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-ink">
        <NotebookPen size={15} />
        Research note & collections
      </summary>

      <div className="mt-4 space-y-3">
        <label
          className="block text-metadata"
          htmlFor={`note-${type}`}
        >
          Private note
        </label>

        <textarea
          id={`note-${type}`}
          value={note}
          maxLength={1000}
          onChange={(event) =>
            setNote(event.target.value)
          }
          rows={3}
          className="w-full rounded-xl border border-line bg-background p-3 text-sm text-ink outline-none focus:border-brand1"
          placeholder="What do you want to remember?"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={saveNote}
            disabled={saving}
          >
            {saving && (
              <LoaderCircle
                size={14}
                className="animate-spin"
              />
            )}

            Save note
          </button>

          {collections.map(
            (collection) => (
              <button
                key={collection.id}
                type="button"
                className="btn btn-sm"
                onClick={() =>
                  addToCollection(
                    collection.id
                  )
                }
              >
                <FolderPlus size={14} />
                {collection.name}
              </button>
            )
          )}
        </div>

        {message && (
          <p
            className="text-xs text-ink3"
            role="status"
          >
            {message}
          </p>
        )}
      </div>
    </details>
  );
}