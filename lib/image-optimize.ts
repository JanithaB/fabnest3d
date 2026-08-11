import sharp from "sharp"

/** Max longest edge for marketplace/gallery images (keeps retina quality, cuts huge camera dumps). */
const MAX_DIMENSION = 2560

/** High visual quality WebP — typically much smaller than JPEG/PNG. */
const WEBP_QUALITY = 85

export type OptimizedImage = {
  buffer: Buffer
  filename: string
  mimeType: "image/webp"
  size: number
  originalFilename: string
}

/**
 * Convert uploaded raster images to optimized WebP for products/gallery storage.
 * Models and non-images should not call this.
 */
export async function optimizeImageToWebp(
  input: Buffer,
  originalFilename: string,
): Promise<OptimizedImage> {
  const image = sharp(input, { failOn: "none" }).rotate()

  const meta = await image.metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0

  let pipeline = image
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
  }

  const buffer = await pipeline
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
      smartSubsample: true,
    })
    .toBuffer()

  const base =
    originalFilename.replace(/\.[^.]+$/, "").replace(/[^\w.\-()+ ]+/g, "_").trim() ||
    "image"

  return {
    buffer,
    filename: `${base}.webp`,
    mimeType: "image/webp",
    size: buffer.length,
    originalFilename,
  }
}
