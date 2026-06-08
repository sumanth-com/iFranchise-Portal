import sharp from "sharp";

export const WEBP_MIME = "image/webp";
export const WEBP_EXTENSION = ".webp";

export type OptimizedImage = {
  buffer: Buffer;
  mimeType: typeof WEBP_MIME;
  extension: typeof WEBP_EXTENSION;
  width: number;
  height: number;
  sizeBytes: number;
};

const OPTIMIZABLE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
]);

export function isOptimizableImageMime(mime: string): boolean {
  return OPTIMIZABLE_MIME.has(mime.toLowerCase());
}

export async function optimizeImageToWebp(
  input: Buffer,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number },
): Promise<OptimizedImage> {
  const quality = options?.quality ?? 82;
  const maxWidth = options?.maxWidth ?? 1920;
  const maxHeight = options?.maxHeight ?? 1920;

  let pipeline = sharp(input, { failOn: "none" }).rotate();

  pipeline = pipeline.resize(maxWidth, maxHeight, {
    fit: "inside",
    withoutEnlargement: true,
  });

  const buffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
  const meta = await sharp(buffer).metadata();

  return {
    buffer,
    mimeType: WEBP_MIME,
    extension: WEBP_EXTENSION,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    sizeBytes: buffer.length,
  };
}
