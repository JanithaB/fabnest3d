/**
 * Normalize a file URL so it is always served through the /api/files route.
 *
 * In production, Next.js only knows about static files present at build time.
 * Files uploaded after `next build` aren't served until a restart.
 * Routing through /api/files reads from disk on every request, so newly
 * uploaded images appear immediately.
 *
 * This also handles legacy URLs stored in the database that use the old
 * direct-from-public format (e.g. "/products/img.jpg").
 */
export function normalizeFileUrl(url: string | null | undefined): string {
  if (!url) return ''

  // Already normalized
  if (url.startsWith('/api/files/')) return url

  // External / absolute URLs — leave untouched
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  // Legacy direct-from-public URLs like /products/..., /gallery/..., /uploads/...
  // Rewrite to /api/files/...
  if (
    url.startsWith('/products/') ||
    url.startsWith('/gallery/') ||
    url.startsWith('/uploads/')
  ) {
    return `/api/files${url}`
  }

  // Anything else (e.g. placeholder SVGs in /gallery/placeholder.svg) — leave as-is
  return url
}
