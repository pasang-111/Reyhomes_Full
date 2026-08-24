import { api, ApiError } from "./client";
import type { HomeLandPackage, HomeLandPackageListItem } from "@/types/land";

export type PackageFilters = {
  category?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  garage?: number | string;
  featured?: boolean;
  state?: string;
  estate?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  search?: string;
  ordering?: string;
  page?: number;
};

function buildQuery(filters: PackageFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function getPackages(
  filters: PackageFilters = {}
): Promise<HomeLandPackageListItem[]> {
  try {
    const data = await api.get<
      { results?: HomeLandPackageListItem[] } | HomeLandPackageListItem[]
    >(`/packages/${buildQuery(filters)}`, { next: { revalidate: 60 } });
    if (Array.isArray(data)) return data;
    return data.results ?? [];
  } catch (err) {
    throw err;
  }
}

export async function getPackageBySlug(
  slug: string
): Promise<HomeLandPackage | null> {
  try {
    return await api.get<HomeLandPackage>(`/packages/${slug}/`, {
      next: { revalidate: 30 },
    });
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) return null;
    return null;
  }
}

export type EstateListItem = {
  id: number;
  name: string;
  slug?: string;
  suburb?: string;
  state?: string;
};

export async function getEstates(): Promise<EstateListItem[]> {
  try {
    const data = await api.get<EstateListItem[] | { results?: EstateListItem[] }>(
      "/estates/",
      { next: { revalidate: 120 } }
    );
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw err;
  }
}
