import { z } from "zod";

export const DEFAULT_TIME_ZONE = "America/Phoenix";
export const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const date = z.iso.date({ error: "Use a valid calendar date (YYYY-MM-DD)." });
const optionalDate = z.union([date, z.literal("")]);
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Use a local time in HH:MM format.");
export const toMinute = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
export const fromMinute = (value: number) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
const windowSchema = z.object({
  id: z.uuid(), dayOfWeek: z.number().int().min(0).max(6), start: time,
  end: z.union([time, z.literal("24:00")]),
  timeZone: z.string().max(100).refine(value => { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }, "Use a valid timezone."),
  validFrom: date, validUntil: optionalDate,
}).superRefine((value, ctx) => {
  if (toMinute(value.start) >= toMinute(value.end)) ctx.addIssue({ code: "custom", path: ["end"], message: "End must follow start. Split overnight windows across two days." });
  if (value.validUntil && value.validUntil < value.validFrom) ctx.addIssue({ code: "custom", path: ["validUntil"], message: "End date cannot precede start date." });
});
export const volunteerSchema = z.object({
  id: z.uuid({ error: "Invalid volunteer ID." }),
  updatedAt: z.union([z.iso.datetime(), z.literal("")]),
  displayName: z.string().trim().min(1, "Enter a name.").max(120, "Name must be 120 characters or fewer."),
  email: z.union([z.email({ error: "Enter a valid email address." }).max(254), z.literal("")]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  foodHandlerIssuedOn: optionalDate, foodHandlerExpiresOn: optionalDate,
  roleIds: z.array(z.uuid()).max(100).refine(ids => new Set(ids).size === ids.length, "Select each role once."),
  availability: z.array(windowSchema).max(100, "Use no more than 100 availability windows."),
}).superRefine((value, ctx) => {
  if (value.foodHandlerIssuedOn && value.foodHandlerExpiresOn && value.foodHandlerExpiresOn < value.foodHandlerIssuedOn) ctx.addIssue({ code: "custom", path: ["foodHandlerExpiresOn"], message: "Expiration cannot precede issuance." });
  const ids = new Set<string>();
  value.availability.forEach((a, i) => {
    if (ids.has(a.id)) ctx.addIssue({ code: "custom", path: ["availability", i], message: "Each window must be unique." });
    ids.add(a.id);
    for (const b of value.availability.slice(0, i)) {
      if (a.dayOfWeek === b.dayOfWeek && a.timeZone === b.timeZone && toMinute(a.start) < toMinute(b.end) && toMinute(b.start) < toMinute(a.end) && a.validFrom <= (b.validUntil || "9999-12-31") && b.validFrom <= (a.validUntil || "9999-12-31")) {
        ctx.addIssue({ code: "custom", path: ["availability", i], message: "Availability windows overlap in time and effective dates. Adjust or remove one." });
      }
    }
  });
});
export type VolunteerInput = z.infer<typeof volunteerSchema>;
export type SaveResult = { ok: true; id: string } | { ok: false; error: string; issues?: string[] };
