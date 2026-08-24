import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProjects } from "@/lib/api/projects";
import { safeList } from "@/lib/api/safe";
import ApiErrorBanner from "@/components/common/ApiErrorBanner";

export default async function UpcomingProjectsPage() {
  const { data: projects, error } = await safeList(() =>
    getProjects({ status: "upcoming" }).catch(() => [] as Awaited<ReturnType<typeof getProjects>>)
  );

  return (
    <main className="bg-[#0B0B0C] text-white">
      <section className="relative overflow-hidden pt-40 pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="text-xs uppercase tracking-[0.45em] text-[#d8c7a4]">
            Coming soon
          </p>
          <h1 className="mt-4 font-display text-[clamp(3.4rem,8vw,8rem)] leading-[.86] tracking-[-.04em]">
            Upcoming <span className="italic text-[#cfd5dc]">Projects.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
            Be first to discover the next ReyHomes addresses as they move from
            concept to reality.
          </p>
        </div>
      </section>

      <section className="pb-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ApiErrorBanner message={error} className="mb-8" />

          {projects.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[.03]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {project.hero_image_url && (
                      <Image
                        src={project.hero_image_url}
                        alt={project.title}
                        fill
                        sizes="(max-width:768px) 100vw, 50vw"
                        className="object-cover transition duration-1000 group-hover:scale-[1.04]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-5">
                      <div>
                        <p className="text-[9px] uppercase tracking-[.4em] text-[#d8c7a4]">
                          Upcoming
                        </p>
                        <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                          {project.title}
                        </h2>
                        {project.location && (
                          <p className="mt-1 text-sm text-white/50">
                            {project.location}
                          </p>
                        )}
                      </div>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/20 transition group-hover:bg-white group-hover:text-black">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : !error ? (
            <div className="rounded-[30px] border border-white/10 bg-white/[.03] p-16 text-center">
              <p className="font-display text-3xl">
                The next chapter is being prepared.
              </p>
              <p className="mt-3 text-white/45">
                Register an enquiry to receive release updates.
              </p>
              <Link
                href="/enquire"
                className="mt-7 inline-block rounded-full border border-white/20 px-7 py-3 text-sm"
              >
                Register interest
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
