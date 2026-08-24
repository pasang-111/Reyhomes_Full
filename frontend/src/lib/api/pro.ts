import { authFetch } from "./auth";

export type ProMilestone = {
  id: number; title: string; description: string; status: "pending" | "in_progress" | "completed";
  order: number; due_date?: string | null; completed_at?: string | null;
};
export type ProBuild = {
  id: number; current_stage: string; site_address: string; start_date?: string | null;
  estimated_completion?: string | null; progress: number; contract: Record<string, unknown> | null; milestones: ProMilestone[];
};
export type ProNotification = { id: number; title: string; message: string; notification_type: string; read: boolean; link: string; created_at: string };
export type ProThread = { id: number; subject: string; agent_name: string; created_at: string; updated_at: string; messages: { id: number; sender_name: string; mine: boolean; body: string; read: boolean; created_at: string }[] };
export type ClientInclusion = { id: number; category: string; title: string; description: string; selected: boolean; notes: string; build?: number | null };

export async function getProDashboard() {
  return authFetch<{ user: { id: number; name: string; email: string }; build: ProBuild | null; notifications: ProNotification[] }>("/api/pro/dashboard/", { auth: true });
}

export async function getProThreads() { return authFetch<ProThread[]>("/api/pro/threads/", { auth: true }); }
export async function startProThread(subject: string, body: string) { return authFetch<ProThread>("/api/pro/threads/", { method: "POST", auth: true, body: { subject, body } }); }
export async function sendProMessage(threadId: number, body: string) { return authFetch<{ id: number; created_at: string }>(`/api/pro/threads/${threadId}/messages/`, { method: "POST", auth: true, body: { body } }); }
export async function getProInclusions() { return authFetch<ClientInclusion[]>("/api/pro/inclusions/", { auth: true }); }
export async function addProInclusion(body: Pick<ClientInclusion, "category" | "title" | "description" | "selected" | "notes">) { return authFetch<ClientInclusion>("/api/pro/inclusions/", { method: "POST", auth: true, body }); }
export async function updateProInclusion(id: number, body: Partial<Pick<ClientInclusion, "category" | "title" | "description" | "selected" | "notes">>) { return authFetch<ClientInclusion>(`/api/pro/inclusions/${id}/`, { method: "PATCH", auth: true, body }); }
export async function deleteProInclusion(id: number) { return authFetch<void>(`/api/pro/inclusions/${id}/`, { method: "DELETE", auth: true }); }
export async function getProNotifications() { return authFetch<ProNotification[]>("/api/pro/notifications/", { auth: true }); }
export async function markProNotificationRead(id: number) { return authFetch<ProNotification>(`/api/pro/notifications/${id}/read/`, { method: "POST", auth: true }); }
