import { api, ApiError } from "./client";
import type { HomeDesign, HomeDesignListItem } from "@/types/home";

export type DesignFilters = {
  category?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  garage?: number | string;
  featured?: boolean;
  state?: string;
  status?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  search?: string;
  ordering?: string;
  page?: number;
  published?: boolean;
};

function buildQuery(filters: DesignFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getDesigns(
  filters: DesignFilters = {}
): Promise<HomeDesignListItem[]> {
  try {
    const data = await api.get<
      { results?: HomeDesignListItem[] } | HomeDesignListItem[]
    >(`/designs/${buildQuery(filters)}`, { next: { revalidate: 60 } });
    if (Array.isArray(data)) return data;
    return data.results ?? [];
  } catch (err) {
    throw err;
  }
}

/** Staff: all designs including unpublished. */
export async function getDesignBySlug(
  slug: string
): Promise<HomeDesign | null> {
  try {
    return await api.get<HomeDesign>(`/designs/${slug}/`, {
      next: { revalidate: 30 },
    });
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) return null;
    return null;
  }
}

export async function getFeaturedDesigns(
  limit = 6
): Promise<HomeDesignListItem[]> {
  const designs = await getDesigns({ featured: true });
  return designs.slice(0, limit);
}
