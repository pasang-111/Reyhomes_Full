/** An inclusion linked via the real FK relation (homes.DesignInclusion / land.PackageInclusion). */
export type LinkedInclusionItem = {
  id: number;
  title: string;
  slug: string;
  category: string;
  image_url?: string | null;
  pdf_url?: string | null;
  features?: string[];
  order?: number;
};

/**
 * `inclusions`/`related` can still be plain strings for records that haven't
 * been migrated off the deprecated inclusion_list/related_slugs fields yet.
 * Always check the type before rendering (see inclusionLabel/inclusionKey helpers).
 */
export type InclusionItem = LinkedInclusionItem | string;

export function inclusionLabel(item: InclusionItem): string {
  return typeof item === "string" ? item : item.title;
}

export type RelatedDesignItem = {
  id: number;
  slug: string;
  title: string;
  price?: string;
  hero_image_url?: string | null;
};

export type RelatedItem = RelatedDesignItem | string;

export type HomeDesignListItem = {
  id: number;
  slug: string;
  name: string;
  title?: string;
  subtitle?: string;
  category: string;
  status?: string;
  price: string;
  beds: number;
  baths: number | string;
  garage: number;
  living?: number;
  study?: number;
  houseSize?: string;
  house_size?: string;
  frontage?: string;
  depth?: string;
  min_lot_width?: string;
  hero_image_url?: string | null;
  image?: string | null;
  featured?: boolean;
};

export type HomeDesignGalleryItem = {
  id: number;
  image_url: string;
  alt_text?: string;
  order: number;
};

export type HomeDesignFeature = {
  id: number;
  title: string;
  description?: string;
  image_url?: string | null;
  order: number;
};

export type HomeDesign = {
  id: number;
  slug: string;
  name: string;
  title?: string;
  subtitle?: string;
  category: string;
  status?: string;
  state?: string;
  suburb?: string;
  price: string;
  price_value?: number | null;
  beds: number;
  baths: number | string;
  garage: number;
  living?: number;
  study?: number;
  houseSize?: string;
  house_size?: string;
  land_size?: string;
  width?: string;
  length?: string;
  frontage?: string;
  depth?: string;
  minLotWidth?: string;
  min_lot_width?: string;
  description?: string;
  hero_image_url?: string | null;
  image?: string | null;
  floor_plan_url?: string | null;
  floorplan?: string | null;
  gallery?: HomeDesignGalleryItem[];
  features?:
    | HomeDesignFeature[]
    | Array<string | { title: string; description?: string; image?: string }>;
  inclusions?: InclusionItem[];
  related?: RelatedItem[];
  featured?: boolean;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
};
