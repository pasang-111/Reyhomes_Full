import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDesigns, getDesignBySlug } from "@/lib/api/designs";

import HomeHero from "@/components/home/details/HomeHero";
import HomeGallery from "@/components/home/details/HomeGallery";
import HomeFeatures from "@/components/home/details/HomeFeatures";
import HomeSpecs from "@/components/home/details/HomeSpecs";
import HomeInclusions from "@/components/home/details/HomeInclusions";
import FloorPlan from "@/components/home/details/FloorPlan";
import RelatedHomes from "@/components/home/details/RelatedHomes";
import EnquiryCTA from "@/components/home/details/EnquiryCTA";
import StickyEnquireBar from "@/components/home/details/StickyEnquireBar";
import DesignPackButton from "@/components/home/details/DesignPackButton";

type Params = { slug: string };

export async function generateStaticParams() {
  try {
    const designs = await getDesigns();
    return designs.map((item) => ({ slug: item.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const home = await getDesignBySlug(slug);
  if (!home) return { title: "Home Design Not Found" };

  const name = home.name || home.title || slug;
  const description =
    home.description ??
    `Explore the ${name} home design — ${home.beds} bed, ${home.baths} bath, ${home.garage} car.`;

  const image = home.hero_image_url ?? home.image ?? undefined;

  return {
    title: `${name} | Home Designs`,
    description,
    openGraph: {
      title: name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function HomeDesignDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const [home, designs] = await Promise.all([
    getDesignBySlug(slug),
    getDesigns(),
  ]);

  if (!home) notFound();

  const name = home.name || home.title || "This design";

  return (
    <>
      <HomeHero home={home} />
      <HomeSpecs home={home} />
      <HomeGallery home={home} />
      <HomeFeatures home={home} />
      <FloorPlan home={home} />
      <HomeInclusions home={home} />
      <RelatedHomes home={home} designs={designs} />
      <div className="flex flex-wrap items-center justify-center gap-4 bg-[#0A1420] py-8">
        <DesignPackButton slug={home.slug} name={name} />
      </div>
      <EnquiryCTA
        href={`/enquire?design=${encodeURIComponent(home.slug)}`}
        heading={name}
        subheading={`Speak with our team about ${name} — site fit, facade options, and next steps. No account required to enquire.`}
      />
      <StickyEnquireBar
        name={name}
        slug={home.slug}
        price={home.price}
        category={home.category}
      />
    </>
  );
}
