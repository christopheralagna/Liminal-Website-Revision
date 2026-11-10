import { addDays, dayNumber, localInstant } from "./dates";
export const startOfWeek = (date: string) => addDays(date, -dayNumber(date));
export const weekDates = (date: string) => Array.from({ length: 7 }, (_, day) => addDays(startOfWeek(date), day));
export function shiftsOnDay<T extends { id: string; startsAt: Date; endsAt: Date }>(shifts: T[], date: string) {
  const start = localInstant(date, 0), end = localInstant(addDays(date, 1), 0);
  return shifts.filter(shift => shift.startsAt < end && shift.endsAt > start).map(shift => ({
    shift,
    continuesFrom: shift.startsAt < start,
    continuesTo: shift.endsAt > end,
    startsAt: shift.startsAt < start ? start : shift.startsAt,
    endsAt: shift.endsAt > end ? end : shift.endsAt,
    overlapping: shifts.some(other => other.id !== shift.id && other.startsAt < end && other.endsAt > start && other.startsAt < shift.endsAt && other.endsAt > shift.startsAt),
  }));
}
