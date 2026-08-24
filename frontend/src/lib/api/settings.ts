import { api } from "./client";

export type SiteSettings = {
  company_name: string;
  phone?: string;
  email?: string;
  address?: string;
  logo_url?: string | null;
  footer_logo_url?: string | null;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await api.get<SiteSettings>("/settings/", {
      next: { revalidate: 300 },
    });
  } catch {
    return null;
  }
}
