import { getInclusions } from "@/lib/api/inclusions";
import { safeList } from "@/lib/api/safe";
import ApiErrorBanner from "@/components/common/ApiErrorBanner";
import InclusionsClient from "./InclusionsClient";

export default async function InclusionsPage() {
  const { data: inclusions, error } = await safeList(() => getInclusions());

  return (
    <>
      <ApiErrorBanner message={error} className="mx-auto max-w-7xl mt-6 px-5" />
      <InclusionsClient inclusions={inclusions} />
    </>
  );
}
