import { api } from "./client";

export type HeroSlide = {
  id: number;
  title: string;
  subtitle: string;
  description?: string;
  button_text: string;
  button_link: string;
  image_url?: string | null;
  mobile_image_url?: string | null;
  video_url?: string | null;
  poster_url?: string | null;
  order: number;
  active: boolean;
};


/** Public active slides for the homepage. */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const data = await api.get<HeroSlide[] | { results: HeroSlide[] }>(
      "/hero/",
      { next: { revalidate: 60 } }
    );
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (err) {
    throw err;
  }
}
