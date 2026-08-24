/**
 * Normalize media fields from the API.
 * List/detail endpoints return gallery items as objects:
 *   { id, image_url, alt_text?, order? }
 * Older code sometimes assumed plain URL strings.
 */
export type GalleryLike =
  | string
  | {
      url?: string | null;
      src?: string | null;
      image?: string | null;
      image_url?: string | null;
      alt_text?: string | null;
      alt?: string | null;
    }
  | null
  | undefined;

export function mediaUrl(item: GalleryLike): string | null {
  if (!item) return null;
  if (typeof item === "string") {
    const s = item.trim();
    return s || null;
  }
  const candidate =
    item.image_url || item.url || item.src || item.image || null;
  if (!candidate || typeof candidate !== "string") return null;
  const s = candidate.trim();
  return s || null;
}

export function galleryUrls(
  items: GalleryLike[] | null | undefined,
  fallbacks: GalleryLike[] = []
): string[] {
  const raw = [...(items || []), ...fallbacks];
  const out: string[] = [];
  for (const item of raw) {
    const u = mediaUrl(item);
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}
