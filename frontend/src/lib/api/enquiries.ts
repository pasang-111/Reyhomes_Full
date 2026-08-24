import { api } from "./client";

export type EnquiryPayload = {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source?: string;
  related_slug?: string;
};

export async function submitEnquiry(
  payload: EnquiryPayload
): Promise<{ success: boolean; message: string }> {
  return api.post("/enquiries/", payload);
}
