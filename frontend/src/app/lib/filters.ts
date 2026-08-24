import type { HomeDesignListItem } from "@/types/home";

export const STOREY_CATEGORIES = ["Single Storey", "Double Storey", "Duplex"] as const;

export type StoreyCategory = (typeof STOREY_CATEGORIES)[number];

export function getDesignsByCategory(
  designs: HomeDesignListItem[],
  category: StoreyCategory
) {
  return designs.filter((design) => design.category === category);
}

export function groupDesignsByCategory(designs: HomeDesignListItem[]) {
  return {
    singleStorey: getDesignsByCategory(designs, "Single Storey"),
    doubleStorey: getDesignsByCategory(designs, "Double Storey"),
    duplex: getDesignsByCategory(designs, "Duplex"),
  };
}
