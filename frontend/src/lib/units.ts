/** Area → m² · linear → m. Does not change site colours — display only. */
const AREA_RE = /m\s*[²2]|sq\.?\s*m|square\s*met/i;

function extractNumber(raw: string): number | null {
  const m = String(raw).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = parseFloat(m[0]);
  return Number.isFinite(n) ? n : null;
}

function trimNum(n: number): string {
  return String(Number(n.toFixed(2)));
}

export function formatArea(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "—";
  const s = String(value).trim();
  if (s === "—" || s.toLowerCase() === "n/a") return "—";
  const n = extractNumber(s);
  if (n === null) return s;
  return `${trimNum(n)} m²`;
}

export function formatMetres(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "—";
  const s = String(value).trim();
  if (s === "—" || s.toLowerCase() === "n/a") return "—";
  const n = extractNumber(s);
  if (n === null) return s;
  return `${trimNum(n)} m`;
}

export function parseMetres(value?: string | number | null): number {
  if (value === null || value === undefined || value === "") return 0;
  return extractNumber(String(value)) ?? 0;
}
