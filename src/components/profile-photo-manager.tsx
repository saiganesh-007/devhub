"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import {
  clampCropOffset,
  getCropDisplayMetrics,
  getCropSourceRect,
} from "@/lib/profile-photo-crop";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 2 * 1024 * 1024;
const INVALID_MSG = "Please choose a JPG, PNG or WebP image under 2 MB.";
const BUCKET = "avatars";
const EXPORT_SIZE = 512;
const CROP_DIAMETER = 188;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

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

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load the selected image."));
    };
    image.src = objectUrl;
  });
}

async function createCroppedWebp(file: File, crop: { zoom: number; offsetX: number; offsetY: number }, cropSize: number) {
  const image = await loadImageElement(file);
  const rect = getCropSourceRect({
    imageWidth: image.naturalWidth,
    imageHeight: image.naturalHeight,
    cropSize,
    zoom: crop.zoom,
    offsetX: crop.offsetX,
    offsetY: crop.offsetY,
  });

  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the image crop.");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.clearRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
  context.drawImage(
    image,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    EXPORT_SIZE,
    EXPORT_SIZE,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (!nextBlob) {
          reject(new Error("Could not export the cropped image."));
          return;
        }
        resolve(nextBlob);
      },
      "image/webp",
      0.9,
    );
  });

  return new File([blob], "avatar.webp", { type: "image/webp" });
}

/**
 * Settings profile-photo manager: choose -> crop -> save / remove.
 * Uploads to the `avatars` bucket at `{user.id}/avatar-{timestamp}.webp`
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
  const cropRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [cropSize, setCropSize] = useState(CROP_DIAMETER);
  const [crop, setCrop] = useState({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<"saving" | "removing" | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (!cropRef.current) return;
    const updateCropSize = () => {
      const nextSize = cropRef.current?.getBoundingClientRect().width ?? CROP_DIAMETER;
      setCropSize(nextSize || CROP_DIAMETER);
    };

    updateCropSize();
    const observer = new ResizeObserver(updateCropSize);
    observer.observe(cropRef.current);
    return () => observer.disconnect();
  }, [preview]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const previewMetrics = imageSize
    ? getCropDisplayMetrics({
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
        cropSize,
        zoom: crop.zoom,
      })
    : null;

  const imageStyle = previewMetrics
    ? {
        width: `${previewMetrics.displayWidth * crop.zoom}px`,
        height: `${previewMetrics.displayHeight * crop.zoom}px`,
        left: `${previewMetrics.left + crop.offsetX}px`,
        top: `${previewMetrics.top + crop.offsetY}px`,
      }
    : undefined;

  function resetCrop() {
    setCrop({ zoom: 1, offsetX: 0, offsetY: 0 });
  }

  function openPicker() {
    if (busy) return;
    setError("");
    inputRef.current?.click();
  }

  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!next) return;
    if (!ACCEPTED_TYPES.includes(next.type) || next.size > MAX_BYTES) {
      setError(INVALID_MSG);
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setImageSize(null);
    setCrop({ zoom: 1, offsetX: 0, offsetY: 0 });
    setError("");
    setStatus("");
    setConfirmRemove(false);
  }

  function cancelPreview() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setImageSize(null);
    setCrop({ zoom: 1, offsetX: 0, offsetY: 0 });
    setError("");
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!imageSize || busy) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: crop.offsetX,
      startOffsetY: crop.offsetY,
    };
    setDragging(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId || !imageSize) return;

    const next = clampCropOffset({
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      cropSize,
      zoom: crop.zoom,
      offsetX: dragRef.current.startOffsetX + (event.clientX - dragRef.current.startX),
      offsetY: dragRef.current.startOffsetY + (event.clientY - dragRef.current.startY),
    });

    setCrop((current) => ({ ...current, offsetX: next.offsetX, offsetY: next.offsetY }));
  }

  function handlePointerUp(event?: React.PointerEvent<HTMLDivElement>) {
    if (event && dragRef.current.pointerId !== null && dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current = { ...dragRef.current, active: false, pointerId: null };
    setDragging(false);
  }

  async function savePhoto() {
    if (!file || busy || !imageSize) return;
    setBusy("saving");
    setError("");
    setStatus("");
    try {
      const cropBlob = await createCroppedWebp(file, crop, cropSize);
      const supabase = createSupabaseBrowser();
      if (!supabase) throw new Error("Photo storage is not configured.");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You are signed out. Sign in and try again.");

      const path = `${user.id}/avatar-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, cropBlob, { contentType: "image/webp", upsert: false });
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
        await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined);
        throw new Error("Could not save your photo. Please try again.");
      }

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
        {preview && file ? (
          <div className="flex w-full flex-col items-center gap-3">
            <div
              ref={cropRef}
              role="img"
              aria-label="Crop the selected image"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative isolate overflow-hidden border border-brand1/40 bg-surface-3 select-none"
              style={{
                width: "min(72vw, 188px)",
                height: "min(72vw, 188px)",
                borderRadius: "9999px",
                boxShadow: "0 0 0 9999px rgba(17, 17, 17, 0.34)",
                cursor: dragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-full border border-white/20" />
              <Image
                src={preview}
                alt=""
                unoptimized
                draggable={false}
                className="pointer-events-none absolute select-none object-cover"
                onLoad={(event) => {
                  const target = event.currentTarget;
                  setImageSize({
                    width: target.naturalWidth,
                    height: target.naturalHeight,
                  });
                }}
                style={imageStyle}
                width={1024}
                height={1024}
              />
            </div>

            <div className="w-full max-w-[240px]">
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-ink3">
                <span>Zoom</span>
                <span>{crop.zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step="0.1"
                value={crop.zoom}
                aria-label="Image zoom"
                onChange={(event) => {
                  const zoom = Number(event.target.value);
                  const next = clampCropOffset({
                    imageWidth: imageSize?.width ?? 1,
                    imageHeight: imageSize?.height ?? 1,
                    cropSize,
                    zoom,
                    offsetX: crop.offsetX,
                    offsetY: crop.offsetY,
                  });
                  setCrop({ zoom, offsetX: next.offsetX, offsetY: next.offsetY });
                }}
                className="w-full accent-brand1"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <button type="button" onClick={resetCrop} disabled={disabled} className="btn btn-secondary btn-sm">
                Reset
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={savePhoto} disabled={disabled} className="btn btn-primary btn-sm">
                {saving && <LoaderCircle size={14} aria-hidden="true" className="animate-spin" />}
                {saving ? "Uploading..." : "Save photo"}
              </button>
              <button type="button" onClick={cancelPreview} disabled={disabled} className="btn btn-secondary btn-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            aria-label={preview ? "Preview of new profile photo. Activate to choose a different photo." : "Profile photo. Activate to change photo."}
            className="group relative rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserAvatar name={displayName} src={currentUrl} providerSrc={providerUrl} size={96} />
            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center rounded-full bg-black/0 text-[11px] font-semibold text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100 group-focus-visible:bg-black/45 group-focus-visible:opacity-100"
            >
              Change
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          onChange={onFileSelected}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {!preview && !confirmRemove ? (
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
        ) : null}

        {confirmRemove && (
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
