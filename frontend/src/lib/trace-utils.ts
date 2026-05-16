export const SPEAKER_COLORS = [
  { bg: "#eef2ff", text: "#4f46e5", border: "#c7d2fe" },
  { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4" },
  { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff" },
  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  { bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" },
  { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  { bg: "#ecfeff", text: "#0e7490", border: "#a5f3fc" },
];

export function getSpeakerColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SPEAKER_COLORS[Math.abs(hash) % SPEAKER_COLORS.length];
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 60) return "< 1 min";
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export function deadlineUrgency(deadline: string | null): "overdue" | "soon" | "later" | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "later";
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) return "overdue";
  if (diff < 2) return "soon";
  return "later";
}

export function typeBadgeColors(t: string): { bg: string; text: string } {
  switch (t) {
    case "planning":
      return { bg: "var(--blue-dim)", text: "var(--blue)" };
    case "review":
      return { bg: "var(--green-dim)", text: "var(--green)" };
    case "standup":
      return { bg: "var(--amber-dim)", text: "var(--amber)" };
    case "onboarding":
      return { bg: "var(--accent-dim)", text: "var(--accent)" };
    default:
      return { bg: "var(--surface-2)", text: "var(--ink-2)" };
  }
}

export function typeAccentBorder(t: string): string {
  switch (t) {
    case "planning":
      return "var(--blue)";
    case "review":
      return "var(--green)";
    case "standup":
      return "var(--amber)";
    case "onboarding":
      return "var(--accent)";
    default:
      return "var(--border-mid)";
  }
}
