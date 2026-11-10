import Link from "next/link";
export const scheduleTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", dateStyle: "medium", timeStyle: "short" });
export const timeText = (value: number) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
export const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function SchedulingNav() {
  return <nav aria-label="Scheduling" className="mb-6 flex flex-wrap gap-5 text-peach-200 underline"><Link href="/admin/scheduling">Schedule</Link><Link href="/admin/scheduling/patterns">Repeating schedules</Link><Link href="/admin/scheduling/types">Shift types</Link></nav>;
}
export function ShiftState({ status }: { status: string }) {
  return <span className={`rounded border px-2 py-1 text-sm ${status === "CANCELLED" ? "border-peach-200 text-peach-200" : status === "COMPLETED" ? "border-olive-300 text-cream-200" : "border-charcoal-500"}`}>{status.toLowerCase()}</span>;
}

export function repeatingTime(start: number, duration: number) {
  const clock = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", hour: "numeric", minute: "2-digit" });
  const base = Date.UTC(2027, 0, 1);
  return `${clock.format(new Date(base + start * 60000))}–${clock.format(new Date(base + (start + duration) * 60000))}${start + duration >= 1440 ? " (ends next day)" : ""}`;
}
