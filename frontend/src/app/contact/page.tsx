"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealGroup, RevealItem, FloatGlow, luxeEase } from "@/components/common/motion";
import { api, ApiError } from "@/lib/api/client";

const CONTACT_DETAILS = [
  {
    icon: Phone,
    label: "Call Us",
    value: "1300 755 495",
    href: "tel:1300755495",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "hello@reyhomes.com.au",
    href: "mailto:hello@reyhomes.com.au",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "3/39 Memorial Ave, Liverpool NSW 2170",
    href: "https://maps.google.com/?q=3/39+Memorial+Ave+Liverpool+NSW+2170",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Mon – Fri, 9am – 5pm",
    href: null,
  },
];

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "Single Storey",
    message: "",
  });

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
      const [firstName, ...rest] = form.name.trim().split(" ");
      await api.post("/enquiries/", {
        first_name: firstName || form.name.trim(),
        last_name: rest.join(" "),
        email: form.email,
        phone: form.phone,
        subject: form.interest,
        message: form.message,
        source: "Contact Page",
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-[#0C2A44]/12 bg-white px-5 py-4 text-[#0C2A44] outline-none transition placeholder:text-[#0C2A44]/35 focus:border-[#D8C7A4] focus:ring-4 focus:ring-[#D8C7A4]/15";

  return (
    <main className="bg-[#0C2A44]">
      {/* Hero */}
      <section className="rh-section relative overflow-hidden pb-24 pt-40 text-[#F5F0E6] md:pb-32 md:pt-48">
        <FloatGlow
          className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#D8C7A4]/08 blur-[160px]"
          duration={24}
        />
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--lg rh-orb--drift-a"
            style={{ top: "-15%", right: "-10%" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#D8C7A4]">
              <span className="h-px w-10 bg-[#D8C7A4]/50" />
              Get In Touch
            </p>
            <h1 className="max-w-3xl font-display text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
              Let&apos;s Build
              <br />
              <span className="italic text-[#D8C7A4]">Something Beautiful</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-white/55 md:text-xl">
              Whether you&apos;re starting from scratch or ready to knock down
              and rebuild, our team is here to guide you every step of the way.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact cards */}
      <section className="rh-section relative pb-24">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--navy rh-orb--md rh-orb--drift-b"
            style={{ top: "10%", left: "-8%" }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <RevealGroup
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.08}
          >
            {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[#D8C7A4]/35">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D8C7A4]/10 text-[#D8C7A4] transition-colors duration-500 group-hover:bg-[#D8C7A4] group-hover:text-[#0C2A44]">
                    <Icon size={20} />
                  </div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    {label}
                  </p>
                  <p className="text-lg font-light text-[#F5F0E6]">{value}</p>
                </div>
              );

              return (
                <RevealItem key={label}>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* Form + Map */}
      <section className="rh-section relative bg-[#F5F0E6] py-24 sm:py-32">
        <div className="rh-orbs" aria-hidden="true">
          <div
            className="rh-orb rh-orb--silver rh-orb--md rh-orb--drift-c"
            style={{ bottom: "-15%", right: "5%", opacity: 0.3 }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Reveal>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#806D48]">
                  Send an Enquiry
                </p>
                <h2 className="mb-10 font-display text-4xl font-light text-[#0C2A44] md:text-5xl">
                  Tell us about your project
                </h2>
              </Reveal>

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-[#0C2A44]/08 bg-white p-12 text-center shadow-sm"
                  >
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#D8C7A4]/20 text-[#806D48]">
                      <CheckCircle2 size={24} />
                    </div>
                    <h3 className="font-display text-2xl font-light text-[#0C2A44]">
                      Thank you, {form.name.split(" ")[0] || "there"}!
                    </h3>
                    <p className="mt-3 text-[#0C2A44]/55">
                      We&apos;ve received your enquiry and will be in touch within
                      one business day.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {status === "error" && (
                      <div className="rounded-2xl border border-[#D8C7A4]/40 bg-[#D8C7A4]/10 px-5 py-4 text-sm text-[#0C2A44]">
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#0C2A44]/70">
                          Full Name
                        </label>
                        <input
                          required
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="John Smith"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#0C2A44]/70">
                          Phone
                        </label>
                        <input
                          required
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="04XX XXX XXX"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#0C2A44]/70">
                        Email
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#0C2A44]/70">
                        I&apos;m interested in
                      </label>
                      <select
                        name="interest"
                        value={form.interest}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option>Single Storey</option>
                        <option>Double Storey</option>
                        <option>Duplex</option>
                        <option>Home &amp; Land Package</option>
                        <option>Knockdown Rebuild</option>
                        <option>Not Sure Yet</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#0C2A44]/70">
                        Message
                      </label>
                      <textarea
                        required
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us a little about your block, budget, or timeline…"
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="group inline-flex items-center gap-2 rounded-full bg-[#0C2A44] px-10 py-4 text-sm font-semibold text-[#F5F0E6] transition hover:-translate-y-0.5 hover:bg-[#0A2035] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "loading" ? "Sending…" : "Send Enquiry"}
                      {status !== "loading" && (
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Map card */}
            <div className="lg:col-span-2">
              <div className="sticky top-32 overflow-hidden rounded-3xl border border-[#0C2A44]/10 bg-[#0C2A44] shadow-xl">
                <div className="h-[280px] w-full">
                  <iframe
                    title="ReyHomes Office Location"
                    className="h-full w-full grayscale contrast-125"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src="https://www.google.com/maps?q=3/39+Memorial+Ave,+Liverpool+NSW+2170&output=embed"
                  />
                </div>
                <div className="p-8 text-[#F5F0E6]">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D8C7A4]">
                    Head Office
                  </p>
                  <p className="text-lg font-light">
                    3/39 Memorial Ave
                    <br />
                    Liverpool NSW 2170
                  </p>
                  <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm text-white/50">
                    <div className="flex items-center justify-between">
                      <span>Monday – Friday</span>
                      <span className="text-[#F5F0E6]">9am – 5pm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Saturday</span>
                      <span className="text-[#F5F0E6]">By Appointment</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sunday</span>
                      <span className="text-white/40">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}