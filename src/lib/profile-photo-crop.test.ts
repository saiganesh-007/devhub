import assert from "node:assert/strict";
import test from "node:test";
import { clampCropOffset, getCropSourceRect } from "./profile-photo-crop.ts";

test("getCropSourceRect keeps the centered cover crop aligned with the preview", () => {
  const rect = getCropSourceRect({
    imageWidth: 1200,
    imageHeight: 900,
    cropSize: 200,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });

  assert.ok(Math.abs(rect.x - 150) < 0.001);
  assert.ok(Math.abs(rect.y - 0) < 0.001);
  assert.ok(Math.abs(rect.width - 900) < 0.001);
  assert.ok(Math.abs(rect.height - 900) < 0.001);
});

test("clampCropOffset prevents the image from drifting far enough to reveal blank space", () => {
  const clamped = clampCropOffset({
    imageWidth: 1200,
    imageHeight: 900,
    cropSize: 200,
    zoom: 1,
    offsetX: 120,
    offsetY: -50,
  });

  assert.ok(Math.abs(clamped.offsetX - 33.333333333333336) < 0.001);
  assert.ok(Math.abs(clamped.offsetY + 0) < 0.001);
});
