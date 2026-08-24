"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitEnquiry } from "@/lib/api/enquiries";
import { Reveal, FloatGlow, luxeEase } from "@/components/common/motion";

const INTERESTS = [
  "Single Storey",
  "Double Storey",
  "Duplex",
  "Dual Occupancy",
  "Home & Land",
  "Knockdown Rebuild",
  "General Enquiry",
];

export default function EnquirePage() {
  const searchParams = useSearchParams();
  const designSlug = searchParams.get("design") || searchParams.get("home") || "";
  const packageSlug = searchParams.get("package") || searchParams.get("land") || "";
  const relatedSlug = designSlug || packageSlug || "";

  const interestDefault = packageSlug
    ? "Home & Land"
    : designSlug
      ? "Single Storey"
      : "General Enquiry";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    subject: interestDefault,
    message: "",
  });

  useEffect(() => {
    const label = designSlug
      ? designSlug.replace(/-/g, " ")
      : packageSlug
        ? packageSlug.replace(/-/g, " ")
        : "";
    const kind = designSlug ? "home design" : packageSlug ? "home & land package" : "";
    setForm((prev) => ({
      ...prev,
      subject: packageSlug
        ? "Home & Land"
        : designSlug && prev.subject === "General Enquiry"
          ? "Single Storey"
          : prev.subject,
      message:
        prev.message.trim()
          ? prev.message
          : relatedSlug
            ? `I am interested in the ${label} ${kind} (ref: ${relatedSlug}). Please contact me with more information.`
            : prev.message,
    }));
  }, [designSlug, packageSlug, relatedSlug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      await submitEnquiry({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
        source: designSlug
          ? "design-detail"
          : packageSlug
            ? "package-detail"
            : "enquire-page",
        related_slug: relatedSlug || undefined,
      } as any);
      setStatus("success");
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        subject: "General Enquiry",
        message: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#0C2A44] text-[#F5F0E6]">
      <section className="relative overflow-hidden pb-20 pt-40 lg:pb-28 lg:pt-48">
        <FloatGlow
          className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#D8C7A4]/10 blur-[140px]"
          duration={22}
        />
        <FloatGlow
          className="pointer-events-none absolute -left-32 bottom-0 h-[480px] w-[480px] rounded-full bg-[#1A4A6E]/25 blur-[130px]"
          duration={26}
          x={20}
          y={-15}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
              Start a conversation
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-[#F5F0E6] sm:text-6xl">
              Enquire
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#F5F0E6]/55">
              {relatedSlug
                ? `You’re enquiring about ${relatedSlug.replace(/-/g, " ")}. Tell us a little about yourself and we’ll be in touch.`
                : "Tell us what you’re looking for — design, land, or a knockdown rebuild — and our team will respond promptly."}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative pb-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_340px] lg:px-10">
          <Reveal>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10"
            >
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center py-16 text-center"
                  >
                    <CheckCircle2 className="text-[#D8C7A4]" size={48} />
                    <h2 className="mt-6 font-display text-3xl">Thank you</h2>
                    <p className="mt-3 max-w-md text-sm text-[#F5F0E6]/55">
                      We’ve received your enquiry and will be in touch shortly.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="First name" name="first_name" value={form.first_name} onChange={handleChange} required />
                      <Field label="Last name" name="last_name" value={form.last_name} onChange={handleChange} />
                      <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
                      <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
                    </div>
                    <div className="mt-5">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D8C7A4]/90">
                        Interest
                      </label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-[#F5F0E6] outline-none focus:border-[#D8C7A4]/50"
                      >
                        {INTERESTS.map((i) => (
                          <option key={i} value={i} className="bg-[#0C2A44]">
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-5">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D8C7A4]/90">
                        Message
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        required
                        className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-[#F5F0E6] outline-none focus:border-[#D8C7A4]/50"
                      />
                    </div>
                    {status === "error" && (
                      <p className="mt-4 text-sm text-red-300">{errorMessage}</p>
                    )}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0C2A44] transition hover:-translate-y-0.5 disabled:opacity-60"
                      style={{
                        background: "linear-gradient(135deg, #F5F0E6, #E8D9B8, #D8C7A4)",
                      }}
                    >
                      {status === "loading" ? "Sending…" : "Send enquiry"}
                      <Send size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="font-display text-2xl text-[#F5F0E6]">Contact</h3>
              <p className="flex items-start gap-3 text-sm text-[#F5F0E6]/60">
                <Phone size={16} className="mt-0.5 shrink-0 text-[#D8C7A4]" />
                <span>Speak with our new homes team during business hours.</span>
              </p>
              <p className="flex items-start gap-3 text-sm text-[#F5F0E6]/60">
                <Mail size={16} className="mt-0.5 shrink-0 text-[#D8C7A4]" />
                <span>Or send this form — we respond to every enquiry.</span>
              </p>
              <p className="flex items-start gap-3 text-sm text-[#F5F0E6]/60">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#D8C7A4]" />
                <span>
                  Not sure if we build near you?{" "}
                  <a href="/where-we-build" className="text-[#D8C7A4] underline-offset-2 hover:underline">
                    Check where we build
                  </a>
                  .
                </span>
              </p>
              <a
                href="/home-designs"
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D8C7A4]"
              >
                Browse designs <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D8C7A4]/90">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-[#F5F0E6] outline-none focus:border-[#D8C7A4]/50"
      />
    </div>
  );
}
