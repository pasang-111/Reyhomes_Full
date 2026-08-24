import type { Testimonial } from "@/lib/api/testimonials";

export type VideoItem = {
  id: number;
  title: string;
  subtitle: string;
  thumbnail: string;
  embedUrl: string;
  videoFileUrl: string;
};

export function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:embed\/|v=|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/** Convert watch/share URLs to embeddable iframe src */
export function toEmbedUrl(url: string): string {
  const raw = (url || "").trim();
  if (!raw) return "";
  if (raw.includes("youtube.com/embed/")) return raw;
  const id = getYoutubeId(raw);
  if (id) return `https://www.youtube.com/embed/${id}`;
  // Vimeo
  const vimeo = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return raw;
}

export function toVideoItem(t: Testimonial): VideoItem {
  const embedUrl = toEmbedUrl(t.video_url || "");
  const videoFileUrl = (t.video_file_url || "").trim();
  let thumbnail = (t.photo_url || "").trim();
  if (!thumbnail && embedUrl) {
    const id = getYoutubeId(t.video_url || embedUrl);
    if (id) thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return {
    id: t.id,
    title: t.name,
    subtitle: [t.role, t.suburb, t.design].filter(Boolean).join(" · "),
    thumbnail,
    embedUrl,
    videoFileUrl,
  };
}

export function filterVideoTestimonials(list: Testimonial[]): Testimonial[] {
  return (list || []).filter(
    (t) => Boolean(t.video_url?.trim()) || Boolean(t.video_file_url?.trim())
  );
}
