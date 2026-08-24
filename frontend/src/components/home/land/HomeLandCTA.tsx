"use client";

interface EnquiryCTAProps {
  onEnquire?: () => void;
  href?: string;
  heading?: string;
  subheading?: string;
}

const STYLES = {
  section:
    "relative py-20 sm:py-28 md:py-36 bg-neutral-950 text-white overflow-hidden",
  glow: "absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#C94B5C]/10 blur-3xl",
  grid: "absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]",
  eyebrow: "inline-block text-[11px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#C94B5C]/90 mb-4 sm:mb-6",
  heading: "font-display text-3xl sm:text-4xl md:text-6xl font-light mb-4 sm:mb-6 tracking-tight",
  accent: "italic bg-gradient-to-r from-[#C7C9CC] to-[#8C1D2C] bg-clip-text text-transparent",
  divider: "w-16 h-px bg-[#C94B5C]/60 mx-auto mb-6 sm:mb-8",
  subheading: "text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-xl mx-auto text-neutral-300 font-light leading-relaxed",
  cta: "group relative inline-flex items-center gap-2 sm:gap-3 px-7 sm:px-10 py-3.5 sm:py-4 border border-[#C94B5C]/70 text-[#C7C9CC] font-medium tracking-wide uppercase text-xs sm:text-sm transition-all duration-500 hover:bg-[#C94B5C] hover:text-neutral-950 focus:outline-none focus:ring-1 focus:ring-offset-4 focus:ring-offset-neutral-950 focus:ring-[#C94B5C]",
  arrow: "transition-transform duration-500 group-hover:translate-x-1",
} as const;

function BackgroundDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className={STYLES.glow} />
      <div className={STYLES.grid} />
    </div>
  );
}

export default function EnquiryCTA({
  onEnquire,
  href = "/contact",
  heading = "Your Horizon",
  subheading = "Speak with our team and begin crafting a home built entirely around you.",
}: EnquiryCTAProps) {
  return (
    <section className={STYLES.section}>
      <BackgroundDecoration />

      <div className="relative container mx-auto px-4 sm:px-6 text-center">
        <span className={STYLES.eyebrow}>Private Consultation</span>

        <h2 className={STYLES.heading}>
          Ready to Build <span className={STYLES.accent}>{heading}</span>
        </h2>

        <div className={STYLES.divider} />

        <p className={STYLES.subheading}>{subheading}</p>

        <a href={href} onClick={onEnquire} className={STYLES.cta}>
          Enquire Now
          <span className={STYLES.arrow} aria-hidden="true">
            &rarr;
          </span>
        </a>
      </div>
    </section>
  );
}