import { api } from "./client";

export type Testimonial = {
  id: number;
  name: string;
  role?: string;
  suburb?: string;
  design?: string;
  review: string;
  rating: number;
  photo_url?: string | null;
  video_file_url?: string | null;
  video_url?: string | null;
  featured: boolean;
  published?: boolean;
};


export async function getTestimonials(
  featuredOnly = false
): Promise<Testimonial[]> {
  const qs = featuredOnly ? "?featured=true" : "";
  try {
    const data = await api.get<Testimonial[] | { results: Testimonial[] }>(
      `/testimonials/${qs}`,
      { next: { revalidate: 120 } }
    );
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw err;
  }
}
