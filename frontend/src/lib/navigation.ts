/**
 * Shared navigation helpers — keep redirects consistent and safe.
 */

/** Strip query/hash and trailing slash (except root). */
export function normalizePath(path: string | null | undefined): string {
  if (!path || typeof path !== "string") return "/";
  let p = path.split("?")[0].split("#")[0].trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}

/** True for same-origin relative paths only (blocks //evil.com open redirects). */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path || typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return true;
}

/**
 * Resolve post-auth destination from ?next= or a fallback.
 * @example resolveNextPath(searchParams.get("next"), "/")
 */
export function resolveNextPath(
  next: string | null | undefined,
  fallback = "/"
): string {
  return isSafeInternalPath(next) ? normalizePath(next) : fallback;
}

/** Build /login?next=… preserving an optional next target. */
export function loginPathWithNext(next?: string | null): string {
  if (!isSafeInternalPath(next)) return "/login";
  const qs = new URLSearchParams({ next: normalizePath(next) });
  return `/login?${qs.toString()}`;
}

/** After register → login, with optional next and registered flag. */
export function loginAfterRegisterPath(next?: string | null): string {
  const qs = new URLSearchParams({ registered: "1" });
  if (isSafeInternalPath(next)) qs.set("next", normalizePath(next));
  return `/login?${qs.toString()}`;
}
