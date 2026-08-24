"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { wishlistApi } from "@/lib/api/wishlist";

export type WishlistEntry = {
  wishlistId?: number;
  kind: "design" | "land";
  id: number;
  slug: string;
  name: string;
  image: string;
  price: string;
};

type WishlistContextValue = {
  items: WishlistEntry[];
  count: number;
  isSaved: (kind: "design" | "land", id: number) => boolean;
  toggle: (entry: WishlistEntry) => Promise<void>;
  remove: (entry: WishlistEntry) => Promise<void>;
  loading: boolean;
  requiresAuth: boolean;
};

/**
 * Wishlist is account-backed only (API /api/wishlist/).
 * There is no localStorage fallback — items require login and survive refresh.
 */
const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

/**
 * Convert API wishlist row into the frontend WishlistEntry format.
 */
function mapWishlistRow(w: any): WishlistEntry | null {
  if (w?.home_design) {
    const id = Number(w.home_design.id);
    if (!id) {
      return null;
    }
    return {
      wishlistId: Number(w.id),
      kind: "design",
      id,
      slug: w.home_design.slug || "",
      name: w.home_design.name || w.home_design.title || "",
      image: w.home_design.hero_image_url || w.home_design.image || "",
      price: w.home_design.price || "",
    };
  }

  if (w?.land_package) {
    const id = Number(w.land_package.id);
    if (!id) {
      return null;
    }
    return {
      wishlistId: Number(w.id),
      kind: "land",
      id,
      slug: w.land_package.slug || "",
      name: w.land_package.title || "",
      image:
        w.land_package.hero_image_url ||
        w.land_package.heroImage ||
        w.land_package.image ||
        "",
      price: w.land_package.price || "",
    };
  }

  return null;
}

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * ------------------------------------------------------------
   * LOAD WISHLIST
   * ------------------------------------------------------------
   */
  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadWishlist() {
      setLoading(true);
      try {
        const response = await wishlistApi.list();
        if (cancelled) {
          return;
        }

        const rows = Array.isArray(response) ? response : [];
        const mapped = rows
          .map(mapWishlistRow)
          .filter((item): item is WishlistEntry => Boolean(item));

        setItems(mapped);
      } catch (error) {
        console.error("Failed to load wishlist:", error);
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /**
   * ------------------------------------------------------------
   * IS SAVED
   * ------------------------------------------------------------
   */
  const isSaved = useCallback(
    (kind: "design" | "land", id: number) => {
      const numericId = Number(id);
      if (!numericId) {
        return false;
      }
      return items.some(
        (item) => item.kind === kind && Number(item.id) === numericId
      );
    },
    [items]
  );

  /**
   * ------------------------------------------------------------
   * REMOVE
   * ------------------------------------------------------------
   */
  const remove = useCallback(
    async (entry: WishlistEntry) => {
      if (!user) {
        throw new Error("LOGIN_REQUIRED");
      }

      const numericId = Number(entry.id);
      if (!numericId) {
        throw new Error("INVALID_WISHLIST_ITEM_ID");
      }

      let existing: WishlistEntry | undefined;

      /**
       * Optimistically remove the item.
       */
      setItems((previous) => {
        existing = previous.find(
          (item) =>
            item.kind === entry.kind && Number(item.id) === numericId
        );
        return previous.filter(
          (item) =>
            !(item.kind === entry.kind && Number(item.id) === numericId)
        );
      });

      if (!existing) {
        return;
      }

      if (!existing.wishlistId) {
        return;
      }

      try {
        await wishlistApi.remove(existing.wishlistId);
      } catch (error) {
        /**
         * API failed — restore the removed item.
         */
        setItems((previous) => {
          const alreadyExists = previous.some(
            (item) =>
              item.kind === entry.kind && Number(item.id) === numericId
          );
          if (alreadyExists) {
            return previous;
          }
          return [existing!, ...previous];
        });
        throw error;
      }
    },
    [user]
  );

  /**
   * ------------------------------------------------------------
   * ADD
   * ------------------------------------------------------------
   */
  const add = useCallback(
    async (entry: WishlistEntry) => {
      if (!user) {
        throw new Error("LOGIN_REQUIRED");
      }

      const numericId = Number(entry.id);

      /**
       * Never allow id=0/NaN into the API.
       */
      if (!numericId) {
        throw new Error("INVALID_WISHLIST_ITEM_ID");
      }

      /**
       * Optimistic update.
       */
      const optimisticEntry: WishlistEntry = {
        ...entry,
        id: numericId,
      };

      setItems((previous) => {
        const alreadyExists = previous.some(
          (item) =>
            item.kind === entry.kind && Number(item.id) === numericId
        );
        if (alreadyExists) {
          return previous;
        }
        return [optimisticEntry, ...previous];
      });

      try {
        // API return type is loosely typed; treat as any so we can read id/pk
        const created: any =
          entry.kind === "design"
            ? await wishlistApi.addDesign(numericId)
            : await wishlistApi.addLand(numericId);

        const wishlistId =
          created?.id ?? created?.pk ?? created?.wishlistId;

        /**
         * Attach backend wishlist ID.
         */
        setItems((previous) =>
          previous.map((item) =>
            item.kind === entry.kind && Number(item.id) === numericId
              ? {
                  ...item,
                  wishlistId: wishlistId
                    ? Number(wishlistId)
                    : item.wishlistId,
                }
              : item
          )
        );
      } catch (error) {
        /**
         * Roll back optimistic item.
         */
        setItems((previous) =>
          previous.filter(
            (item) =>
              !(item.kind === entry.kind && Number(item.id) === numericId)
          )
        );
        throw error;
      }
    },
    [user]
  );

  /**
   * ------------------------------------------------------------
   * TOGGLE
   * ------------------------------------------------------------
   */
  const toggle = useCallback(
    async (entry: WishlistEntry) => {
      if (!user) {
        throw new Error("LOGIN_REQUIRED");
      }

      const numericId = Number(entry.id);
      if (!numericId) {
        throw new Error("INVALID_WISHLIST_ITEM_ID");
      }

      /**
       * We intentionally use the current items value for determining the
       * operation.
       */
      const existing = items.find(
        (item) =>
          item.kind === entry.kind && Number(item.id) === numericId
      );

      if (existing) {
        await remove(existing);
        return;
      }

      await add({
        ...entry,
        id: numericId,
      });
    },
    [items, user, add, remove]
  );

  /**
   * ------------------------------------------------------------
   * CONTEXT VALUE
   * ------------------------------------------------------------
   */
  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isSaved,
      toggle,
      remove,
      loading,
      requiresAuth: !user,
    }),
    [items, isSaved, toggle, remove, loading, user]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
