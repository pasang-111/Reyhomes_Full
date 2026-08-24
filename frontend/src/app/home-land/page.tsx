import { getPackages } from "@/lib/api/packages";
import { safeList } from "@/lib/api/safe";
import ApiErrorBanner from "@/components/common/ApiErrorBanner";
import HomeLandClient from "./HomeLandClient";

export default async function HomeLandPage() {
  const { data: packages, error } = await safeList(() => getPackages());

  return (
    <>
      <ApiErrorBanner message={error} className="mx-auto max-w-7xl mt-6 px-5" />
      <HomeLandClient packages={packages} />
    </>
  );
}
