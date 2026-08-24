import { authFetch } from "./auth";

export const wishlistApi = {
  list: () => authFetch("/api/wishlist/", { auth: true }),

  addDesign: (homeDesignId: number) =>
    authFetch("/api/wishlist/", {
      method: "POST",
      auth: true,
      body: { home_design_id: homeDesignId },
    }),

  addLand: (landPackageId: number) =>
    authFetch("/api/wishlist/", {
      method: "POST",
      auth: true,
      body: { land_package_id: landPackageId },
    }),

  remove: (wishlistItemId: number) =>
    authFetch(`/api/wishlist/${wishlistItemId}/`, {
      method: "DELETE",
      auth: true,
    }),
};
