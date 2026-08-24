"use client";

type Props = {
  title: string;
  description: string;
  embedUrl: string;
  videoFileUrl?: string;
  current: number;
  total: number;
};

export default function VideoPlayer({
  title,
  description,
  embedUrl,
  videoFileUrl = "",
  current,
  total,
}: Props) {
  const hasMedia = Boolean(embedUrl || videoFileUrl);

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-[#0A0A0E] shadow-[0_40px_120px_rgba(0,0,0,.6)]">
      <div className="aspect-[16/8] bg-black">
        {videoFileUrl ? (
          <video
            key={videoFileUrl}
            src={videoFileUrl}
            controls
            playsInline
            className="h-full w-full object-contain"
          />
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            title={title}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">
            Add a YouTube URL or upload a video in Admin → Testimonials
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <div className="absolute right-8 top-8 rounded-full border border-white/20 bg-black/50 px-5 py-2 backdrop-blur-xl">
        <p className="text-[11px] tracking-[0.35em] text-white/90">
          {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>

      <div className="absolute bottom-8 left-8 max-w-md rounded-[28px] border border-white/20 bg-black/50 p-8 backdrop-blur-2xl">
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#C5CAD3]">
          Client story
        </p>
        <h3 className="mt-3 font-display text-4xl text-white">{title}</h3>
        {description ? (
          <p className="mt-4 leading-7 text-white/80">{description}</p>
        ) : null}
        {hasMedia && embedUrl ? (
          <a
            href={embedUrl.replace("/embed/", "/watch?v=")}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-full border border-[#E8EAED]/40 bg-gradient-to-r from-[#E8EAED] via-[#C8CCD4] to-[#9CA3AF] px-7 py-3 text-sm font-semibold text-[#0A1628] shadow-[0_10px_30px_rgba(200,204,212,0.25)] transition hover:-translate-y-0.5"
          >
            Watch Full Tour
          </a>
        ) : null}
      </div>
    </div>
  );
}
