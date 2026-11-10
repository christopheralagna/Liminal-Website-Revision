import { expect, it } from "vitest";
import { addDays, dateValue, localInstant, nextCutover, occurrenceDates, phoenixDate } from "../../src/server/scheduling/dates";
import { generationSchema, patternSchema } from "../../src/server/scheduling/validation";
it("enumerates local weekdays across year and leap-day boundaries, inclusively", () => {
  expect(occurrenceDates("2028-02-22", "2028-03-07", 2)).toEqual(["2028-02-22", "2028-02-29", "2028-03-07"]);
  expect(addDays("2027-12-31", 1)).toBe("2028-01-01");
  expect(occurrenceDates("2027-01-04", addDays("2027-01-04", 55), 1)).toHaveLength(8);
});
it("converts Phoenix local midnight independently of server timezone or DST elsewhere", () => {
  expect(localInstant("2027-03-14", 0).toISOString()).toBe("2027-03-14T07:00:00.000Z");
  expect(localInstant("2027-11-07", 540).toISOString()).toBe("2027-11-07T16:00:00.000Z");
  expect(phoenixDate(new Date("2027-01-01T06:59:59Z"))).toBe("2026-12-31");
});
it("requires successor cutover beyond identity dates, occupied dates, and original start", () => {
  expect(nextCutover("2027-01-01", [{ occurrenceDate: dateValue("2027-02-01"), endsAt: localInstant("2027-02-10", 0) }], "2026-11-10")).toBe("2027-02-10");
  expect(nextCutover("2027-01-01", [{ occurrenceDate: dateValue("2027-02-12"), endsAt: localInstant("2027-02-10", 10) }], "2026-11-10")).toBe("2027-02-13");
  expect(nextCutover("2027-01-01", [], "2026-11-10")).toBe("2027-01-02");
});
it("bounds generation requests and validates calendar dates and rule ranges", () => {
  const id = "b4000000-0000-4000-8000-000000000999";
  expect(generationSchema.safeParse({ id, from: "2027-01-01", until: "2027-02-25" }).success).toBe(true);
  for (const until of ["2027-02-26", "2026-12-31", "2027-02-30"]) expect(generationSchema.safeParse({ id, from: "2027-01-01", until }).success).toBe(false);
  expect(patternSchema.safeParse({ id, definitionId: id, dayOfWeek: 0, start: "23:00", durationMinutes: 1441, capacity: 1, validFrom: "2027-01-01", validUntil: "" }).success).toBe(false);
});
