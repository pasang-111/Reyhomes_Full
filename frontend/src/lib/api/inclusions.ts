import { api } from "./client";

/** Public marketing inclusion — no supplier cost / internal pricing fields. */
export type Inclusion = {
  id: number;
  title: string;
  slug: string;
  category: string;
  tier?: string;
  subtitle?: string;
  description?: string;
  image_url?: string | null;
  pdf_url?: string | null;
  icon?: string;
  features?: string[];
  order: number;
  featured: boolean;
};

export async function getInclusions(params?: {
  category?: string;
  featured?: boolean;
}): Promise<Inclusion[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.featured) search.set("featured", "true");
  const qs = search.toString() ? `?${search.toString()}` : "";

  try {
    const data = await api.get<Inclusion[] | { results: Inclusion[] }>(
      `/inclusions/${qs}`,
      { next: { revalidate: 120 } }
    );
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw err;
  }
}

export async function getInclusion(slug: string): Promise<Inclusion | null> {
  try {
    return await api.get<Inclusion>(`/inclusions/${slug}/`);
  } catch {
    return null;
  }
}
