export function hm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export function bytes(n?: number): string {
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** Human due-date label + whether it's late. */
export function due(date: string | null): { label: string; tone: "late" | "soon" | "normal" } | null {
  if (!date) return null;
  const t = new Date(date + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days = Math.round((t.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return { label: `${Math.abs(days)}d late`, tone: "late" };
  if (days === 0) return { label: "Today", tone: "soon" };
  if (days === 1) return { label: "Tomorrow", tone: "soon" };
  if (days < 7) return { label: `${days}d`, tone: "normal" };
  return { label: t.toLocaleDateString(undefined, { month: "short", day: "numeric" }), tone: "normal" };
}

/** Mon..Sun of the week containing `anchor` (0 = this week, -1 = last week). */
export function weekDates(offsetWeeks = 0): string[] {
  const d = new Date();
  d.setDate(d.getDate() + offsetWeeks * 7);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

export function dayLabel(date: string): { dow: string; num: string } {
  const d = new Date(date + "T00:00:00");
  return {
    dow: d.toLocaleDateString(undefined, { weekday: "short" }),
    num: String(d.getDate()),
  };
}

export const isToday = (date: string) => date === new Date().toISOString().slice(0, 10);
