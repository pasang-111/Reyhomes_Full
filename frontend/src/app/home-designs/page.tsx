import { getDesigns } from "@/lib/api/designs";
import { safeList } from "@/lib/api/safe";
import ApiErrorBanner from "@/components/common/ApiErrorBanner";
import HomeDesignsClient from "./HomeDesignsClient";

export default async function HomeDesignsPage() {
  const { data: designs, error } = await safeList(() => getDesigns());

  return (
    <>
      <ApiErrorBanner message={error} className="mx-auto max-w-7xl mt-6 px-5" />
      <HomeDesignsClient designs={designs} />
    </>
  );
}
