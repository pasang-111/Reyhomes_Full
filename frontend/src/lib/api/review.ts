import { api, API_BASE, ApiError } from "./client";

export type ReviewInclusion = {
  id: number;
  title: string;
  slug?: string;
  category?: string;
  description?: string;
  features?: string[];
  image_url?: string | null;
  pdf_url?: string | null;
  order?: number;
};

export type ReviewPayload = {
  kind: "design" | "package";
  slug: string;
  title: string;
  subtitle?: string;
  floor_plan_url?: string | null;
  inclusions: ReviewInclusion[];
  share_token?: string;
  share_path?: string;
  pdf_url: string;
};

export async function getDesignReview(slug: string): Promise<ReviewPayload> {
  return api.get<ReviewPayload>(`/designs/${encodeURIComponent(slug)}/review/`);
}

export async function getPackageReview(slug: string): Promise<ReviewPayload> {
  return api.get<ReviewPayload>(`/packages/${encodeURIComponent(slug)}/review/`);
}

export async function getReviewByToken(token: string): Promise<ReviewPayload> {
  return api.get<ReviewPayload>(`/review/${encodeURIComponent(token)}/`);
}

/** Absolute URL for the combined PDF (opens in browser / iframe). */
export function reviewPdfAbsoluteUrl(pdfPath: string): string {
  if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) return pdfPath;
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${pdfPath.startsWith("/") ? pdfPath : `/${pdfPath}`}`;
}

export { ApiError };
