import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/api/projects";
import { safeList } from "@/lib/api/safe";
import ApiErrorBanner from "@/components/common/ApiErrorBanner";
import { Reveal, FloatGlow } from "@/components/common/motion";

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  under_construction: "Under Construction",
  upcoming: "Upcoming",
};

export default async function ProjectsPage() {
  const [upcomingRes, underRes, completedRes] = await Promise.all([
    safeList(() => getProjects({ status: "upcoming" })),
    safeList(() => getProjects({ status: "under_construction" })),
    safeList(() => getProjects({ status: "completed" })),
  ]);

  const apiError =
    upcomingRes.error || underRes.error || completedRes.error || null;

  const sections = [
    { key: "upcoming", title: "Upcoming Projects", items: upcomingRes.data },
    {
      key: "under_construction",
      title: "Under Construction",
      items: underRes.data,
    },
    { key: "completed", title: "Completed Projects", items: completedRes.data },
  ].filter((s) => s.items.length > 0);

  // Fallback: all projects if status filters empty (and no hard API failure)
  let all: Awaited<ReturnType<typeof getProjects>> | null = null;
  let allError: string | null = null;
  if (sections.length === 0 && !apiError) {
    const res = await safeList(() => getProjects());
    all = res.data;
    allError = res.error;
  }

  const displaySections =
    sections.length > 0
      ? sections
      : all && all.length
        ? [{ key: "all", title: "All Projects", items: all }]
        : [];

  const error = apiError || allError;

  return (
    <main className="bg-[#0B0B0C] text-white">
      <section className="rh-section relative overflow-hidden pt-40 pb-20">
        <FloatGlow
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#d8c7a4]/10 blur-[160px]"
          duration={20}
          x={26}
          y={-16}
        />
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-b"
            style={{ bottom: "-15%", right: "-6%" }}
          />
        </div>
        <Reveal className="relative z-10 mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-[0.45em] text-[#d8c7a4]">
            Our Work
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight md:text-7xl">
            Projects
            <span className="block italic text-[#cfd5dc]">brought to life.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
            From upcoming releases to completed homes — every ReyHomes address,
            in one place.
          </p>
        </Reveal>
      </section>

      <section className="rh-section pb-28">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--navy rh-orb--lg rh-orb--drift-c"
            style={{ top: "10%", left: "-10%" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ApiErrorBanner message={error} className="mb-8" />

          {displaySections.length === 0 && !error ? (
            <div className="rounded-[30px] border border-white/10 bg-white/[.03] p-16 text-center">
              <p className="font-display text-3xl">Projects are being prepared.</p>
              <p className="mt-3 text-white/45">
                Check back soon, or register an enquiry for release updates.
              </p>
              <Link
                href="/enquire"
                className="mt-7 inline-block rounded-full border border-white/20 px-7 py-3 text-sm transition hover:border-[#d8c7a4] hover:text-[#d8c7a4]"
              >
                Register interest
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              {displaySections.map((section) => (
                <div key={section.key}>
                  <h2 className="mb-8 font-display text-3xl text-white/90">
                    {section.title}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {section.items.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.slug}`}
                        className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[.03]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          {project.hero_image_url ? (
                            <Image
                              src={project.hero_image_url}
                              alt={project.title}
                              fill
                              sizes="(max-width:768px) 100vw, 50vw"
                              className="object-cover transition duration-1000 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-white/5" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <p className="text-[9px] uppercase tracking-[.4em] text-[#d8c7a4]">
                              {STATUS_LABEL[project.status] || project.status}
                            </p>
                            <h3 className="mt-2 font-display text-3xl sm:text-4xl">
                              {project.title}
                            </h3>
                            {project.location ? (
                              <p className="mt-1 text-sm text-white/50">
                                {project.location}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
