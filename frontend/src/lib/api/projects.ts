import { api } from "./client";

export type ProjectListItem = {
  id: number;
  title: string;
  slug: string;
  location?: string;
  category?: string;
  status: string;
  hero_image_url?: string | null;
  featured: boolean;
};

export type Project = ProjectListItem & {
  description?: string;
  gallery?: {
    id: number;
    image_url: string;
    alt_text: string;
    order: number;
  }[];
  features?: {
    id: number;
    title: string;
    description: string;
    image_url?: string;
    order: number;
  }[];
};

export async function getProjects(params?: {
  featured?: boolean;
  status?: string;
}): Promise<ProjectListItem[]> {
  const search = new URLSearchParams();
  if (params?.featured) search.set("featured", "true");
  if (params?.status) search.set("status", params.status);
  const qs = search.toString() ? `?${search.toString()}` : "";

  try {
    const data = await api.get<
      ProjectListItem[] | { results: ProjectListItem[] }
    >(`/projects/${qs}`, { next: { revalidate: 60 } });
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw err;
  }
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  try {
    return await api.get<Project>(`/projects/${slug}/`, {
      next: { revalidate: 30 },
    });
  } catch {
    return null;
  }
}
