export type AvatarCropParams = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export const AVATAR_CROP_VIEW_SIZE = 280;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/** Map viewport crop (pan + zoom) to a square JPEG data URL. */
export async function exportCroppedAvatar(
  imageSrc: string,
  params: AvatarCropParams,
  outputSize = 512,
): Promise<string> {
  const img = await loadImage(imageSrc);
  const view = AVATAR_CROP_VIEW_SIZE;
  const cover = Math.max(view / img.width, view / img.height);
  const displayScale = cover * params.scale;
  const displayW = img.width * displayScale;
  const displayH = img.height * displayScale;
  const left = (view - displayW) / 2 + params.offsetX;
  const top = (view - displayH) / 2 + params.offsetY;

  let sx = -left / displayScale;
  let sy = -top / displayScale;
  let sw = view / displayScale;
  let sh = view / displayScale;

  sx = Math.max(0, Math.min(sx, img.width - 1));
  sy = Math.max(0, Math.min(sy, img.height - 1));
  sw = Math.min(sw, img.width - sx);
  sh = Math.min(sh, img.height - sy);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputSize, outputSize);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export function getInitialCropScale(
  width: number,
  height: number,
  view = AVATAR_CROP_VIEW_SIZE,
): number {
  const cover = Math.max(view / width, view / height);
  const minCover = Math.max(view / width, view / height);
  return cover / minCover || 1;
}
