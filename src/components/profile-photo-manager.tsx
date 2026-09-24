"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 2 * 1024 * 1024;
const INVALID_MSG = "Please choose a JPG, PNG or WebP image under 2 MB.";
const BUCKET = "avatars";

function extensionFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** Extract the object path from a public storage URL, or null when foreign. */
function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = url.indexOf(marker);
  if (at < 0) return null;
  try {
    return decodeURIComponent(url.slice(at + marker.length));
  } catch {
    return null;
  }
}

/**
 * Settings profile-photo manager: choose -> preview -> save / remove.
 * Uploads to the `avatars` bucket at `{user.id}/avatar-{timestamp}.{ext}`
 * (timestamped names bust caches) and persists ONE metadata field,
 * `avatar_url`, on the authenticated user. No auth-flow changes.
 */
export function ProfilePhotoManager({
  displayName,
  currentUrl,
  providerUrl,
  onChanged,
}: {
  displayName: string;
  currentUrl: string | null;
  providerUrl: string | null;
  onChanged: (next: string | null) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<"saving" | "removing" | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Revoke the local preview URL when it is replaced or unmounted.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function openPicker() {
    if (busy) return;
    setError("");
    inputRef.current?.click();
  }

  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    // Allow re-selecting the same file afterwards.
    event.target.value = "";
    if (!next) return;
    if (!ACCEPTED_TYPES.includes(next.type) || next.size > MAX_BYTES) {
      setError(INVALID_MSG);
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setError("");
    setStatus("");
    setConfirmRemove(false);
  }

  function cancelPreview() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError("");
  }

  async function savePhoto() {
    if (!file || busy) return;
    setBusy("saving");
    setError("");
    setStatus("");
    try {
      const supabase = createSupabaseBrowser();
      if (!supabase) throw new Error("Photo storage is not configured.");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You are signed out. Sign in and try again.");

      const path = `${user.id}/avatar-${Date.now()}.${extensionFor(file.type)}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        if (/bucket not found/i.test(uploadError.message)) {
          throw new Error(
            "Profile photo storage is not set up yet. Apply the avatars storage migration, then try again.",
          );
        }
        if (/row-level security|permission|authorized/i.test(uploadError.message)) {
          throw new Error("You don't have permission to upload a photo. Sign in and try again.");
        }
        throw new Error("Upload failed. Please try again.");
      }

      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const { error: metaError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (metaError) {
        // Best effort: remove the orphaned file.
        await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined);
        throw new Error("Could not save your photo. Please try again.");
      }

      // Best effort: delete the previous owned file so storage stays tidy.
      if (currentUrl) {
        const oldPath = storagePathFromUrl(currentUrl);
        if (oldPath && oldPath.startsWith(`${user.id}/`) && oldPath !== path) {
          await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => undefined);
        }
      }

      onChanged(publicUrl);
      cancelPreview();
      setStatus("Profile photo updated.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function removePhoto() {
    if (busy || !currentUrl) return;
    setBusy("removing");
    setError("");
    setStatus("");
    try {
      const supabase = createSupabaseBrowser();
      if (!supabase) throw new Error("Photo storage is not configured.");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You are signed out. Sign in and try again.");

      // Best effort: delete the owned storage file; metadata removal is the source of truth.
      const oldPath = storagePathFromUrl(currentUrl);
      if (oldPath && oldPath.startsWith(`${user.id}/`)) {
        await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => undefined);
      }

      const { error: metaError } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
      if (metaError) throw new Error("Could not remove your photo. Please try again.");

      onChanged(null);
      setConfirmRemove(false);
      setStatus("Profile photo removed.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove your photo. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const saving = busy === "saving";
  const removing = busy === "removing";
  const disabled = busy !== null;

  return (
    <div>
      <p className="text-sm font-medium text-ink">Profile photo</p>

      <div className="mt-3 flex flex-col items-center gap-3 text-center">
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          aria-label={preview ? "Preview of new profile photo. Activate to choose a different photo." : "Profile photo. Activate to change photo."}
          className="group relative rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {preview && file ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              width={96}
              height={96}
              draggable={false}
              className="size-24 rounded-full border border-line object-cover"
              style={{ aspectRatio: "1 / 1" }}
            />
          ) : (
            <UserAvatar name={displayName} src={currentUrl} providerSrc={providerUrl} size={96} />
          )}
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center rounded-full bg-black/0 text-[11px] font-semibold text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100 group-focus-visible:bg-black/45 group-focus-visible:opacity-100"
          >
            Change
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          onChange={onFileSelected}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {preview && file && !confirmRemove ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={savePhoto}
              disabled={disabled}
              className="btn btn-primary btn-sm"
            >
              {saving && <LoaderCircle size={14} aria-hidden="true" className="animate-spin" />}
              {saving ? "Uploading..." : "Save photo"}
            </button>
            <button
              type="button"
              onClick={cancelPreview}
              disabled={disabled}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
          </div>
        ) : !confirmRemove ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              className="btn btn-secondary btn-sm"
            >
              {saving && <LoaderCircle size={14} aria-hidden="true" className="animate-spin" />}
              {saving ? "Uploading..." : "Change photo"}
            </button>
            {currentUrl && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStatus("");
                  setConfirmRemove(true);
                }}
                disabled={disabled}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-semibold text-err transition-colors",
                  "hover:bg-err/5 disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                Remove photo
              </button>
            )}
          </div>
        ) : (
          <div
            role="group"
            aria-label="Confirm photo removal"
            className="rounded-xl border border-line bg-panel px-4 py-3"
          >
            <p className="text-xs font-semibold text-ink">Remove profile photo?</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                disabled={disabled}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={removePhoto}
                disabled={disabled}
                className="btn btn-sm border border-err/40 bg-transparent text-err hover:bg-err/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removing && <LoaderCircle size={14} aria-hidden="true" className="animate-spin" />}
                {removing ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-ink3">JPG, PNG or WebP. Max 2 MB.</p>
      </div>

      {error && (
        <p role="alert" className="mx-auto mt-3 max-w-sm text-center text-xs leading-5 text-err">
          {error}
        </p>
      )}
      {status && !error && (
        <p role="status" className="mx-auto mt-3 max-w-sm text-center text-xs leading-5 text-brand1">
          {status}
        </p>
      )}
    </div>
  );
}
