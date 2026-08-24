import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProjectBySlug, getProjects } from "@/lib/api/projects";

type Params = { slug: string };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-[#080909] text-white">
      <section className="relative min-h-[78svh] overflow-hidden">
        {project.hero_image_url && (
          <Image
            src={project.hero_image_url}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080909] via-[#080909]/45 to-black/15" />
        <div className="relative mx-auto flex min-h-[78svh] max-w-7xl items-end px-5 pb-16 pt-40 sm:px-8 sm:pb-20 lg:px-10">
          <div className="max-w-4xl">
            <Link href="/projects" className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[.2em] text-white/60 hover:text-white">
              <ArrowLeft size={14} /> Back to projects
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-[.5em] text-[#d8c7a4]">
              {project.status.replaceAll("_", " ")}
            </p>
            <h1 className="mt-5 font-display text-[clamp(3.5rem,8vw,8rem)] leading-[.86] tracking-[-.04em]">{project.title}</h1>
            {project.location && <p className="mt-6 text-sm uppercase tracking-[.25em] text-white/55">{project.location}</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-28">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.45em] text-[#d8c7a4]">Project brief</p>
          <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">A future address, considered today.</h2>
          <Link href="/enquire" className="moon-button mt-8 rounded-full px-6 py-3 text-sm">Enquire about this project <ArrowUpRight size={15}/></Link>
        </div>
        <div className="space-y-5 text-base leading-8 text-white/55">
          {project.description ? <p>{project.description}</p> : <p>Discover a considered residential project shaped by architecture, materiality and the way modern families live.</p>}
        </div>
      </section>

      {project.gallery?.length ? (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
          <div className="grid gap-5 md:grid-cols-2">
            {project.gallery.map((image) => (
              <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10">
                <Image src={image.image_url} alt={image.alt_text || project.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition duration-1000 hover:scale-[1.03]" />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
