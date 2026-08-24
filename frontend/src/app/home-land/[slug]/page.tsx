import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPackages, getPackageBySlug } from "@/lib/api/packages";

import HomeLandHero from "@/components/home/land/HomeLandHero";
import EstateGallery from "@/components/home/land/EstateGallery";
import LandInformation from "@/components/home/land/LandInformation";
import PackageSummary from "@/components/home/land/PackageSummary";
import PackageInclusions from "@/components/home/land/PackageInclusions";
import FloorPlan from "@/components/home/land/FloorPlan";
import RelatedPackages from "@/components/home/land/RelatedPackages";
import HomeLandCTA from "@/components/home/land/HomeLandCTA";

type Params = { slug: string };

export async function generateStaticParams() {
  const packages = await getPackages();
  return packages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const land = await getPackageBySlug(slug);

  if (!land) {
    return { title: "Home & Land Package Not Found" };
  }

  const description =
    land.description ??
    `Explore the ${land.title} home & land package featuring ${land.beds} bedrooms, ${land.baths} bathrooms and ${land.garage} car garage.`;

  const image = land.hero_image_url ?? land.heroImage ?? land.image ?? undefined;

  return {
    title: `${land.title} | Home & Land Packages`,
    description,
    openGraph: {
      title: land.title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function HomeLandDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const [land, packages] = await Promise.all([
    getPackageBySlug(slug),
    getPackages(),
  ]);

  if (!land) {
    notFound();
  }

  return (
    <>
      <HomeLandHero land={land} />
      <PackageSummary land={land} />
      <EstateGallery land={land} />
      <LandInformation land={land} />
      <PackageInclusions land={land} />
      <FloorPlan pkg={land} />
      <RelatedPackages land={land} packages={packages} />
      <HomeLandCTA />
    </>
  );
}
