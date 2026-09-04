export const CAMPUS_TZ = "America/Los_Angeles";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value: string | null | undefined): value is string {
  return !!value && DATE_RE.test(value);
}

export function todayOnCampus(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CAMPUS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addCampusDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day) + days * 86_400_000;
  return new Date(utc).toISOString().slice(0, 10);
}

export function formatCampusDate(date: string, style: "short" | "long" = "short") {
  const [year, month, day] = date.split("-").map(Number);
  const asUtc = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat("en-US", {
    weekday: style === "long" ? "long" : "short",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(asUtc);
}

export function campusHourMinute(now = new Date()): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TZ,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return { hour, minute };
}

export function currentMealHint(now = new Date()): "Breakfast" | "Lunch" | "Dinner" {
  const { hour, minute } = campusHourMinute(now);
  const mins = hour * 60 + minute;
  if (mins < 10 * 60 + 30) return "Breakfast";
  if (mins < 16 * 60) return "Lunch";
  return "Dinner";
}

export function dateChipLabel(date: string, today: string) {
  if (date === today) return "Today";
  if (date === addCampusDays(today, -1)) return "Yesterday";
  if (date === addCampusDays(today, 1)) return "Tomorrow";
  return formatCampusDate(date, "short");
}
