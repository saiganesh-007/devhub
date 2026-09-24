export type CropGeometry = {
  imageWidth: number;
  imageHeight: number;
  cropSize: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getCropDisplayMetrics({
  imageWidth,
  imageHeight,
  cropSize,
  zoom,
}: Pick<CropGeometry, "imageWidth" | "imageHeight" | "cropSize" | "zoom">) {
  const baseScale = cropSize / Math.min(imageWidth, imageHeight);
  const displayWidth = imageWidth * baseScale;
  const displayHeight = imageHeight * baseScale;
  const targetWidth = displayWidth * zoom;
  const targetHeight = displayHeight * zoom;
  const maxOffsetX = Math.max(0, (targetWidth - cropSize) / 2);
  const maxOffsetY = Math.max(0, (targetHeight - cropSize) / 2);

  return {
    baseScale,
    displayWidth,
    displayHeight,
    left: (cropSize - displayWidth) / 2,
    top: (cropSize - displayHeight) / 2,
    maxOffsetX,
    maxOffsetY,
  };
}

export function clampCropOffset({
  imageWidth,
  imageHeight,
  cropSize,
  zoom,
  offsetX,
  offsetY,
}: CropGeometry) {
  const { maxOffsetX, maxOffsetY } = getCropDisplayMetrics({
    imageWidth,
    imageHeight,
    cropSize,
    zoom,
  });

  return {
    offsetX: clamp(offsetX, -maxOffsetX, maxOffsetX),
    offsetY: clamp(offsetY, -maxOffsetY, maxOffsetY),
  };
}

export function getCropSourceRect({
  imageWidth,
  imageHeight,
  cropSize,
  zoom,
  offsetX,
  offsetY,
}: CropGeometry) {
  const { baseScale, left, top } = getCropDisplayMetrics({
    imageWidth,
    imageHeight,
    cropSize,
    zoom,
  });
  const clamped = clampCropOffset({
    imageWidth,
    imageHeight,
    cropSize,
    zoom,
    offsetX,
    offsetY,
  });

  const effectiveLeft = left + clamped.offsetX;
  const effectiveTop = top + clamped.offsetY;
  const scale = baseScale * zoom;

  const x = (-effectiveLeft) / scale;
  const y = (-effectiveTop) / scale;
  const width = cropSize / scale;
  const height = cropSize / scale;

  return {
    x: clamp(x, 0, imageWidth),
    y: clamp(y, 0, imageHeight),
    width: clamp(width, 0, imageWidth),
    height: clamp(height, 0, imageHeight),
  };
}
