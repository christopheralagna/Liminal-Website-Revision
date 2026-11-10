import { expect, it } from "vitest";
import { startOfWeek, weekDates, shiftsOnDay } from "../../src/server/scheduling/calendar";
import { localInstant } from "../../src/server/scheduling/dates";
it("builds a Sunday-to-Saturday Phoenix calendar across month/year boundaries", () => {
  expect(startOfWeek("2027-01-01")).toBe("2026-12-27");
  expect(weekDates("2027-01-01")).toEqual(["2026-12-27", "2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"]);
});
it("keeps overlapping shifts visible and splits overnight shifts into local day segments", () => {
  const shifts = [
    { id: "overnight", startsAt: localInstant("2027-01-01", 1380), endsAt: localInstant("2027-01-02", 60) },
    { id: "overlap", startsAt: localInstant("2027-01-02", 30), endsAt: localInstant("2027-01-02", 120) },
  ];
  expect(shiftsOnDay(shifts, "2027-01-01")[0]).toMatchObject({ continuesTo: true, continuesFrom: false });
  const next = shiftsOnDay(shifts, "2027-01-02");
  expect(next).toHaveLength(2); expect(next.every(segment => segment.overlapping)).toBe(true);
  expect(next[0]).toMatchObject({ continuesFrom: true, continuesTo: false });
  expect(shiftsOnDay(shifts, "2027-01-03")).toEqual([]);
});
