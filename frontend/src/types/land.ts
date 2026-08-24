import type { InclusionItem } from "./home";

export type { InclusionItem };

export type HomeLandPackageListItem = {
  id: number;
  slug: string;
  title: string;
  estate?: number | null;
  estate_name?: string;
  category: string;
  state?: string;
  suburb?: string;
  price: string;
  beds: number;
  baths: number | string;
  garage: number;
  landSize?: string;
  houseSize?: string;
  frontage?: string;
  depth?: string;
  hero_image_url?: string | null;
  image?: string | null;
  heroImage?: string | null;
  badge?: string;
  featured?: boolean;
};

export type PackageGalleryItem = {
  id: number;
  image_url: string;
  alt_text?: string;
  order: number;
};

export type PackageFeature = {
  id: number;
  title: string;
  description?: string;
  image_url?: string | null;
  order: number;
};

export type Estate = {
  id: number;
  name: string;
  slug: string;
  suburb?: string;
  state?: string;
  description?: string;
  hero_image_url?: string | null;
  package_count?: number;
  published?: boolean;
};

export type HomeLandPackage = {
  id: number;
  slug: string;
  title: string;
  estate?: number | null;
  estate_name?: string;
  estate_detail?: Estate | null;
  category: string;
  state?: string;
  suburb?: string;
  price: string;
  price_value?: number | null;
  beds: number;
  baths: number | string;
  garage: number;
  landSize?: string;
  houseSize?: string;
  frontage?: string;
  depth?: string;
  description?: string;
  hero_image_url?: string | null;
  image?: string | null;
  heroImage?: string | null;
  floor_plan_url?: string | null;
  floorPlan?: string | null;
  gallery?: PackageGalleryItem[];
  features?: PackageFeature[];
  inclusions?: InclusionItem[];
  badge?: string;
  featured?: boolean;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
};
