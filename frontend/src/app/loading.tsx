import { HomePageSkeleton } from "@/components/ui/Skeleton";

/**
 * Shown while the home page (and any parent segment without its own loading.tsx)
 * is resolving server data.
 */
export default function Loading() {
  return <HomePageSkeleton />;
}
