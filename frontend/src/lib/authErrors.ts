import { ApiError } from "@/lib/api/client";

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  password: "Password",
  password_confirm: "Confirm password",
  first_name: "First name",
  last_name: "Last name",
  phone: "Phone",
  non_field_errors: "",
  detail: "",
};

/** Map common DRF / backend phrases to clear member-facing copy. */
function humanizeMessage(raw: string): string {
  const s = raw.trim();
  const lower = s.toLowerCase();

  if (
    lower.includes("already exists") ||
    lower.includes("already registered") ||
    lower.includes("user with this email") ||
    lower.includes("email already") ||
    (lower.includes("unique") && lower.includes("email"))
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  if (
    lower.includes("password is too short") ||
    lower.includes("at least 8") ||
    lower.includes("minimum 8") ||
    (lower.includes("password") && lower.includes("short"))
  ) {
    return "Password is too short. Use at least 8 characters.";
  }

  if (
    lower.includes("too common") ||
    lower.includes("password is too common")
  ) {
    return "This password is too common. Please choose a stronger one.";
  }

  if (
    lower.includes("entirely numeric") ||
    lower.includes("only numbers")
  ) {
    return "Password cannot be entirely numeric. Add letters as well.";
  }

  if (
    lower.includes("too similar") ||
    lower.includes("similar to")
  ) {
    return "Password is too similar to your personal details. Choose something more unique.";
  }

  if (
    lower.includes("passwords do not match") ||
    lower.includes("password fields didn't match") ||
    lower.includes("didn't match")
  ) {
    return "Passwords do not match. Please re-enter them carefully.";
  }

  if (
    lower.includes("invalid credentials") ||
    lower.includes("unable to log in") ||
    lower.includes("no active account") ||
    lower.includes("authentication credentials") ||
    (lower.includes("incorrect") && (lower.includes("password") || lower.includes("email")))
  ) {
    return "Incorrect email or password. Please try again.";
  }

  if (lower.includes("required") && lower.length < 80) {
    return s.endsWith(".") ? s : `${s}.`;
  }

  if (lower.includes("enter a valid email") || lower.includes("valid email address")) {
    return "Please enter a valid email address.";
  }

  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return s;
}

function collectFromBody(body: unknown): string[] {
  if (!body) return [];
  if (typeof body === "string") return [body];
  if (typeof body !== "object") return [];

  const b = body as Record<string, unknown>;
  const out: string[] = [];

  if (typeof b.detail === "string" && b.detail) out.push(b.detail);
  if (Array.isArray(b.detail)) {
    b.detail.forEach((d) => {
      if (typeof d === "string") out.push(d);
    });
  }
  if (typeof b.message === "string" && b.message) out.push(b.message);

  for (const [key, val] of Object.entries(b)) {
    if (key === "detail" || key === "message") continue;
    const label = FIELD_LABELS[key] ?? key.replace(/_/g, " ");
    const msgs: string[] = [];
    if (Array.isArray(val)) {
      val.forEach((v) => {
        if (typeof v === "string") msgs.push(v);
        else if (v && typeof v === "object" && "string" in (v as object)) {
          msgs.push(String((v as { string?: string }).string));
        }
      });
    } else if (typeof val === "string") {
      msgs.push(val);
    }
    for (const m of msgs) {
      if (!m) continue;
      // Field-specific email exists
      if (key === "email" && /exist|unique|already/i.test(m)) {
        out.push("An account with this email already exists. Please sign in instead.");
        continue;
      }
      if (key === "password" && /short|at least|minimum/i.test(m)) {
        out.push("Password is too short. Use at least 8 characters.");
        continue;
      }
      out.push(label ? `${label}: ${m}` : m);
    }
  }

  return out;
}

/**
 * Turn any thrown error from login/register into a clear single message for the UI.
 */
export function formatAuthError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (err instanceof ApiError) {
    const fromBody = collectFromBody(err.body);
    if (fromBody.length) {
      return humanizeMessage(fromBody[0]);
    }
    if (err.message) return humanizeMessage(err.message);
    if (err.status === 400) return "Please check the form and try again.";
    if (err.status === 401) return "Incorrect email or password. Please try again.";
    if (err.status === 409) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (err.status >= 500) return "Our servers are busy. Please try again in a moment.";
  }

  if (err instanceof Error && err.message) {
    if (/failed to fetch|networkerror|load failed/i.test(err.message)) {
      return "Unable to reach the server. Check your connection and try again.";
    }
    return humanizeMessage(err.message);
  }

  return fallback;
}
