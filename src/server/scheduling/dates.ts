// Calendar dates use UTC midnight only as a date container, never as local time.
export const TIME_ZONE = "America/Phoenix";
export const dateOnly = (value: Date) => value.toISOString().slice(0, 10);
export const dateValue = (value: string) => new Date(`${value}T00:00:00.000Z`);
export function addDays(value: string, days: number) {
  const date = dateValue(value);
  date.setUTCDate(date.getUTCDate() + days);
  return dateOnly(date);
}
export const dayNumber = (value: string) => dateValue(value).getUTCDay();
export const daysBetween = (from: string, until: string) => (dateValue(until).getTime() - dateValue(from).getTime()) / 86400000;
export function phoenixDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)!.value).join("-");
}
export function localInstant(date: string, minute: number) {
  // Phoenix has no daylight-saving transitions; this helper supports only Phoenix.
  return new Date(`${date}T${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}:00-07:00`);
}
export function occurrenceDates(from: string, until: string, weekday: number) {
  const dates: string[] = [];
  for (let date = addDays(from, (weekday - dayNumber(from) + 7) % 7); date <= until; date = addDays(date, 7)) dates.push(date);
  return dates;
}
export function nextCutover(validFrom: string, shifts: { occurrenceDate: Date | null; endsAt: Date }[], today = phoenixDate()) {
  return shifts.reduce((next, shift) => {
    const identityNext = shift.occurrenceDate ? addDays(dateOnly(shift.occurrenceDate), 1) : next;
    // Intervals are end-exclusive. Midnight itself does not occupy the next day.
    const actualNext = addDays(phoenixDate(new Date(shift.endsAt.getTime() - 1)), 1);
    return [next, identityNext, actualNext].sort().at(-1)!;
  }, [addDays(validFrom, 1), addDays(today, 1)].sort().at(-1)!);
}
