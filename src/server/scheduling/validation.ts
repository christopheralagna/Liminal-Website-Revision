import { z } from "zod";
import { daysBetween, localInstant } from "./dates";
export const dateSchema = z.iso.date().refine(value => value >= "2000-01-01" && value <= "2099-12-31", "Use a date from 2000 through 2099.");
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM local time.");
export const minute = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
const capacity = z.number().int().positive().max(1000);
export const versionSchema = z.object({ id: z.uuid(), updatedAt: z.iso.datetime() });
export const definitionUpdateSchema = versionSchema.extend({ name: z.string().trim().min(1).max(120), isActive: z.boolean() });
export const definitionSchema = z.object({ id: z.uuid(), name: z.string().trim().min(1).max(120), roleId: z.uuid({ error: "Choose an operational role." }) });
const interval = z.object({ date: dateSchema, start: time, endDate: dateSchema, end: time, capacity });
function validInterval(value: z.infer<typeof interval>) {
  const length = localInstant(value.endDate, minute(value.end)).getTime() - localInstant(value.date, minute(value.start)).getTime();
  return length > 0 && length <= 86400000;
}
const intervalError = { path: ["endDate"], message: "The shift must end after it starts and last no more than 24 hours. Check the dates and times." };
export const shiftSchema = interval.extend({ id: z.uuid(), roleId: z.uuid({ error: "Choose an operational role." }), definitionId: z.uuid({ error: "Choose a shift type." }) }).refine(validInterval, intervalError);
export const editSchema = interval.extend(versionSchema.shape).refine(validInterval, intervalError);
export const patternSchema = z.object({ id: z.uuid(), roleId: z.uuid({ error: "Choose an operational role." }), definitionId: z.uuid({ error: "Choose a shift type." }), dayOfWeek: z.number().int().min(0).max(6), start: time, durationMinutes: z.number().int().min(1).max(1440), capacity, validFrom: dateSchema, validUntil: z.union([dateSchema, z.literal("")]) }).refine(value => !value.validUntil || value.validUntil >= value.validFrom, { path: ["validUntil"], message: "Repeats until must be on or after Repeats from." });
const rangeFields = { from: dateSchema, until: dateSchema };
const boundedRange = (value: { from: string; until: string }) => daysBetween(value.from, value.until) >= 0 && daysBetween(value.from, value.until) < 56;
export const rangeSchema = z.object(rangeFields).refine(value => daysBetween(value.from, value.until) >= 0, { path: ["until"], message: "The viewing end date must be on or after the start date." });
export const generationSchema = z.object({ id: z.uuid(), ...rangeFields }).refine(boundedRange, "Generate between one and 56 calendar dates per request.");
export const extensionSchema = z.object({ id: z.uuid(), updatedAt: z.iso.datetime(), ...rangeFields }).refine(boundedRange, { path: ["until"], message: "Add between one and 56 calendar dates per request." });
export const endSchema = versionSchema.extend({ validUntil: dateSchema });
export const cancelPatternSchema = versionSchema;
export const revisionSchema = z.object({ ...versionSchema.shape, successor: patternSchema });
export type MutationResult = { ok: true; id: string; message?: string } | { ok: false; error: string; issues?: string[]; fieldErrors?: Record<string, string>; blockedShifts?: { id: string; startsAt: string }[] };

export type SchedulingCommand = "definition" | "createShift" | "editShift" | "cancelShift" | "createPattern" | "generate" | "endPattern" | "revisePattern" | "shortenPattern" | "cancelPattern" | "extendPattern" | "updateDefinition" | "deleteDefinition";
export const schedulingSchemas = { definition: definitionSchema, updateDefinition: definitionUpdateSchema, deleteDefinition: versionSchema, createShift: shiftSchema, editShift: editSchema, cancelShift: versionSchema, createPattern: patternSchema, generate: generationSchema, endPattern: endSchema, revisePattern: revisionSchema, shortenPattern: endSchema, cancelPattern: cancelPatternSchema, extendPattern: extensionSchema };
export function validationFields(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(error.issues.map(issue => [String(issue.path[0] || "form"), issue.message]));
}

export const scheduleFiltersSchema = z.object({
  definitionIds: z.array(z.uuid()).max(100).default([]),
  roleIds: z.array(z.uuid()).max(100).default([]),
  showCanceled: z.boolean().default(false),
  page: z.number().int().min(1).max(10000).default(1),
});
export const queryIds = z.union([z.string(), z.array(z.string()).max(100)]).optional();
export const scheduleQuerySchema = z.object({
  view: z.enum(["week", "list"]).optional(), date: dateSchema.optional(), from: dateSchema.optional(), until: dateSchema.optional(),
  definitionId: queryIds, roleId: queryIds, canceled: z.enum(["0", "1"]).optional(),
  page: z.string().regex(/^[1-9]\d{0,3}$|^10000$/).optional(),
});
export function selectedIds(value?: string | string[]): string[] {
  return Array.from(new Set((Array.isArray(value) ? value : value ? [value] : []).filter(Boolean)));
}
