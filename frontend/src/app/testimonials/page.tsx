import { getTestimonials } from "@/lib/api/testimonials";
import TestimonialsPageClient from "./TestimonialsPageClient";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return <TestimonialsPageClient testimonials={testimonials} />;
}
