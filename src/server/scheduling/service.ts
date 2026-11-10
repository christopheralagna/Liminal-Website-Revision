import "server-only";
import { z } from "zod";
import type { Prisma, ShiftPattern } from "../../generated/prisma/client";
import { getDatabase } from "../db";
import { requirePermission } from "../auth/permissions";
import { AuthorizationError } from "../auth/authorization";
import { addDays, dateOnly, dateValue, localInstant, nextCutover, occurrenceDates, TIME_ZONE } from "./dates";
import { definitionSchema, definitionUpdateSchema, scheduleFiltersSchema, editSchema, extensionSchema, endSchema, generationSchema, minute, patternSchema, rangeSchema, validationFields, revisionSchema, shiftSchema, versionSchema, type MutationResult } from "./validation";

class SchedulingError extends Error {
  constructor(message: string, public fieldErrors?: Record<string, string>, public blockedShifts?: { id: string; startsAt: string }[]) { super(message); }
}
const canWrite = (role: string) => role === "ADMIN" || role === "COORDINATOR";
const version = (previous: Date) => new Date(Math.max(Date.now(), previous.getTime() + 1));
const validId = (id: string) => z.uuid().safeParse(id).success;
function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new SchedulingError("Please correct the highlighted fields.", validationFields(result.error));
  return result.data;
}

export async function getSchedulingCatalog() {
  const user = await requirePermission("scheduling:read");
  const db = getDatabase();
  const [definitions, roles] = await Promise.all([
    db.shiftDefinition.findMany({ where: { isActive: true, role: { isActive: true } }, orderBy: { name: "asc" }, select: { id: true, name: true, role: { select: { id: true, name: true } } } }),
    db.volunteerRole.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { definitions, roles, canWrite: canWrite(user.role) };
}
export async function getSchedule(from: string, until: string, filters: { definitionIds?: string[]; roleIds?: string[]; definitionId?: string; roleId?: string; showCanceled?: boolean; page?: number } = {}) {
  const user = await requirePermission("scheduling:read");
  const empty = { shifts: [], canWrite: canWrite(user.role), hasMore: false, windowUntil: until };
  if (!rangeSchema.safeParse({ from, until }).success) return { ...empty, rangeError: "Choose valid viewing dates from 2000 through 2099, with the end on or after the start." };
  const parsedFilters = scheduleFiltersSchema.safeParse({
    definitionIds: filters.definitionIds ?? (filters.definitionId ? [filters.definitionId] : []),
    roleIds: filters.roleIds ?? (filters.roleId ? [filters.roleId] : []),
    showCanceled: filters.showCanceled, page: filters.page,
  });
  if (!parsedFilters.success) return { ...empty, rangeError: "Choose valid shift types, operational roles, and a result page from 1 to 10000. Each filter supports up to 100 selections." };
  const selected = parsedFilters.data;
  // Long selections remain valid: display one year at a time with an explicit continuation.
  const windowUntil = [until, addDays(from, 365)].sort()[0];
  const page = selected.page;
  const shifts = await getDatabase().shift.findMany({
    where: { startsAt: { lt: localInstant(addDays(windowUntil, 1), 0) }, endsAt: { gt: localInstant(from, 0) },
      ...(selected.showCanceled ? {} : { status: { not: "CANCELLED" } }),
      ...(selected.definitionIds.length ? { definitionId: { in: selected.definitionIds } } : {}),
      ...(selected.roleIds.length ? { definition: { roleId: { in: selected.roleIds } } } : {}),
    },
    take: 201, skip: (page - 1) * 200,
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    include: { definition: { include: { role: true } }, _count: { select: { assignments: true } } },
  });
  return { shifts: shifts.slice(0, 200), canWrite: canWrite(user.role), rangeError: null, hasMore: shifts.length > 200, windowUntil };
}
export async function getSchedulingFilters() {
  await requirePermission("scheduling:read");
  const db = getDatabase();
  const [definitions, roles] = await Promise.all([
    db.shiftDefinition.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, roleId: true, isActive: true } }),
    db.volunteerRole.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { definitions, roles };
}
export async function getShiftTypes() {
  const user = await requirePermission("scheduling:read");
  const definitions = await getDatabase().shiftDefinition.findMany({
    orderBy: [{ role: { name: "asc" } }, { name: "asc" }, { id: "asc" }],
    select: { id: true, name: true, isActive: true, role: { select: { id: true, name: true, isActive: true } }, _count: { select: { shifts: true, patterns: true } } },
  });
  return { definitions, canWrite: canWrite(user.role) };
}
export async function getShiftType(id: string) {
  const user = await requirePermission("scheduling:read");
  if (!validId(id)) return null;
  const definition = await getDatabase().shiftDefinition.findUnique({ where: { id }, select: {
    id: true, name: true, isActive: true, updatedAt: true, role: { select: { id: true, name: true, isActive: true } }, _count: { select: { shifts: true, patterns: true } },
  } });
  return definition ? { definition, canWrite: canWrite(user.role) } : null;
}
export function shiftRestriction(shift: { startsAt: Date; status: string; _count: { assignments: number } }) {
  if (shift._count.assignments) return "Assignment history exists. Changes are deferred until assignment management is available.";
  if (shift.status !== "SCHEDULED") return "Completed and canceled shifts are read-only. Restoration is deferred.";
  if (shift.startsAt <= new Date()) return "Shifts that have started are historical and read-only.";
  return null;
}
export async function getShift(id: string) {
  const user = await requirePermission("scheduling:read");
  if (!validId(id)) return null;
  const shift = await getDatabase().shift.findUnique({ where: { id }, include: {
    definition: { include: { role: true } }, pattern: true, _count: { select: { assignments: true } },
    assignments: { orderBy: { createdAt: "asc" }, include: { volunteer: { select: { displayName: true } } } },
  } });
  return shift ? { shift, canWrite: canWrite(user.role), restriction: shiftRestriction(shift) } : null;
}
export async function getPatterns() {
  const user = await requirePermission("scheduling:read");
  const patterns = await getDatabase().shiftPattern.findMany({ orderBy: [{ isActive: "desc" }, { validFrom: "desc" }, { id: "asc" }], include: {
    definition: true, _count: { select: { shifts: { where: { status: "SCHEDULED" } } } }, shifts: { where: { status: "SCHEDULED" }, orderBy: { startsAt: "desc" }, take: 1, select: { occurrenceDate: true, startsAt: true } },
  } });
  return { patterns, canWrite: canWrite(user.role) };
}
export async function getPattern(id: string) {
  const user = await requirePermission("scheduling:read");
  if (!validId(id)) return null;
  const pattern = await getDatabase().shiftPattern.findUnique({ where: { id }, include: {
    definition: { include: { role: true } }, shifts: { orderBy: [{ occurrenceDate: "asc" }, { id: "asc" }] },
  } });
  return pattern ? { pattern, canWrite: canWrite(user.role), earliestCutover: nextCutover(dateOnly(pattern.validFrom), pattern.shifts) } : null;
}

async function lockPattern(tx: Prisma.TransactionClient, id: string) {
  await tx.$queryRaw`SELECT id FROM "ShiftPattern" WHERE id = ${id}::uuid FOR UPDATE`;
  const pattern = await tx.shiftPattern.findUnique({ where: { id } });
  if (!pattern) throw new SchedulingError("Pattern no longer exists. Reload the page.");
  return pattern;
}
function checkVersion(row: { updatedAt: Date }, expected: string) {
  if (row.updatedAt.toISOString() !== expected) throw new SchedulingError("This record changed. Reload the page before saving.");
}
async function activeDefinition(tx: Prisma.TransactionClient, id: string, roleId?: string) {
  await tx.$queryRaw`SELECT id FROM "ShiftDefinition" WHERE id = ${id}::uuid FOR SHARE`;
  const definition = await tx.shiftDefinition.findUnique({ where: { id }, include: { role: true } });
  if (!definition?.isActive || !definition.role.isActive) throw new SchedulingError("Choose an active shift type with an active operational role.", { definitionId: "This shift type is unavailable for new shifts." });
  if (roleId && definition.roleId !== roleId) throw new SchedulingError("The selected shift type does not belong to this operational role.", { definitionId: "Choose a shift type belonging to the selected role." });
}
async function generate(tx: Prisma.TransactionClient, pattern: ShiftPattern, from: string, until: string) {
  if (!pattern.isActive) throw new SchedulingError("This schedule is no longer repeating. Existing shifts remain on record.");
  if (pattern.timeZone !== TIME_ZONE) throw new SchedulingError("Generation supports America/Phoenix only. The stored timezone has been preserved.");
  await activeDefinition(tx, pattern.definitionId);
  const effectiveFrom = [from, dateOnly(pattern.validFrom)].sort().at(-1)!;
  const effectiveUntil = pattern.validUntil ? [until, dateOnly(pattern.validUntil)].sort()[0] : until;
  const dates = effectiveFrom <= effectiveUntil ? occurrenceDates(effectiveFrom, effectiveUntil, pattern.dayOfWeek) : [];
  const existing = await tx.shift.findMany({ where: { patternId: pattern.id, occurrenceDate: { in: dates.map(dateValue) } }, select: { occurrenceDate: true } });
  const known = new Set(existing.map(row => dateOnly(row.occurrenceDate!)));
  const missing = dates.filter(date => !known.has(date));
  if (missing.length) await tx.shift.createMany({ data: missing.map(date => {
    const startsAt = localInstant(date, pattern.startMinute);
    return { definitionId: pattern.definitionId, patternId: pattern.id, occurrenceDate: dateValue(date), startsAt, endsAt: new Date(startsAt.getTime() + pattern.durationMinutes * 60000), capacity: pattern.capacity };
  }) });
  return `Created ${missing.length}; already present ${known.size}. Added shifts for ${from} through ${until}. ${dates.length ? `Repeating dates considered: ${effectiveFrom} through ${effectiveUntil}.` : "No repeating dates match this range."} Existing shifts were preserved.`;
}
async function createPattern(tx: Prisma.TransactionClient, value: z.infer<typeof patternSchema>) {
  await activeDefinition(tx, value.definitionId, value.roleId);
  const pattern = await tx.shiftPattern.create({ data: {
    id: value.id, definitionId: value.definitionId, dayOfWeek: value.dayOfWeek, startMinute: minute(value.start), durationMinutes: value.durationMinutes,
    capacity: value.capacity, timeZone: TIME_ZONE, validFrom: dateValue(value.validFrom), validUntil: value.validUntil ? dateValue(value.validUntil) : null,
  } });
  const message = await generate(tx, pattern, value.validFrom, [addDays(value.validFrom, 55), "2099-12-31"].sort()[0]);
  return { ok: true as const, id: pattern.id, message };
}
import type { SchedulingCommand } from "./validation";
export type { SchedulingCommand } from "./validation";

// Every direct mutation independently checks live authorization before validation.
export async function mutateScheduling(command: SchedulingCommand, input: unknown): Promise<MutationResult> {
  try {
    await requirePermission("scheduling:write");
    const db = getDatabase();
    switch (command) {
      case "definition": {
        const value = parse(definitionSchema, input);
        return await db.$transaction(async tx => {
          const role = await tx.volunteerRole.findUnique({ where: { id: value.roleId } });
          if (!role?.isActive) throw new SchedulingError("Choose an active operational role.");
          await tx.shiftDefinition.create({ data: value });
          return { ok: true, id: value.id, message: "Shift type created." };
        });
      }
      case "updateDefinition":
      case "deleteDefinition": {
        const value = command === "updateDefinition" ? parse(definitionUpdateSchema, input) : parse(versionSchema, input);
        return await db.$transaction(async tx => {
          // FOR UPDATE also serializes against new referencing FK inserts.
          await tx.$queryRaw`SELECT id FROM "ShiftDefinition" WHERE id = ${value.id}::uuid FOR UPDATE`;
          const definition = await tx.shiftDefinition.findUnique({ where: { id: value.id }, include: { role: true, _count: { select: { shifts: true, patterns: true } } } });
          if (!definition) throw new SchedulingError("This shift type no longer exists. Reload the catalog.");
          checkVersion(definition, value.updatedAt);
          if (command === "deleteDefinition") {
            if (definition._count.shifts || definition._count.patterns) throw new SchedulingError(`This shift type is referenced by ${definition._count.shifts} shift(s) and ${definition._count.patterns} repeating schedule(s), including historical or canceled records. Deactivate it instead.`);
            await tx.shiftDefinition.delete({ where: { id: definition.id } });
            return { ok: true, id: definition.id, message: "Unused shift type deleted." };
          }
          const edit = parse(definitionUpdateSchema, input);
          if (edit.isActive && !definition.isActive && !definition.role.isActive) throw new SchedulingError("Reactivate the operational role before reactivating this shift type.", { isActive: "The operational role is inactive." });
          // Role association is deliberately fixed, even for unused definitions.
          await tx.shiftDefinition.update({ where: { id: definition.id }, data: { name: edit.name, isActive: edit.isActive, updatedAt: version(definition.updatedAt) } });
          return { ok: true, id: definition.id, message: "Shift type saved. Linked shifts display its current name." };
        });
      }
      case "createShift": {
        const value = parse(shiftSchema, input);
        return await db.$transaction(async tx => {
          await activeDefinition(tx, value.definitionId, value.roleId);
          const startsAt = localInstant(value.date, minute(value.start));
          if (startsAt <= new Date()) throw new SchedulingError("New shifts must start in the future.", { date: "Choose a future date and time." });
          await tx.shift.create({ data: { id: value.id, definitionId: value.definitionId, startsAt, endsAt: localInstant(value.endDate, minute(value.end)), capacity: value.capacity } });
          return { ok: true, id: value.id };
        });
      }
      case "editShift":
      case "cancelShift": {
        const value = parse(command === "editShift" ? editSchema : versionSchema, input);
        return await db.$transaction(async tx => {
          // Shared pattern lock keeps revision cutover checks consistent with reschedules.
          const origin = await tx.shift.findUnique({ where: { id: value.id }, select: { patternId: true } });
          if (origin?.patternId) await lockPattern(tx, origin.patternId);
          await tx.$queryRaw`SELECT id FROM "Shift" WHERE id = ${value.id}::uuid FOR UPDATE`;
          const shift = await tx.shift.findUnique({ where: { id: value.id }, include: { _count: { select: { assignments: true } } } });
          if (!shift) throw new SchedulingError("Shift no longer exists. Reload the page.");
          checkVersion(shift, value.updatedAt);
          const reason = shiftRestriction(shift);
          if (reason) throw new SchedulingError(reason);
          if (command === "cancelShift") {
            await tx.shift.update({ where: { id: value.id }, data: { status: "CANCELLED", updatedAt: version(shift.updatedAt) } });
          } else {
            const edit = parse(editSchema, input);
            const startsAt = localInstant(edit.date, minute(edit.start));
            if (startsAt <= new Date()) throw new SchedulingError("Rescheduled shifts must start in the future.", { date: "Choose a future date and time." });
            await tx.shift.update({ where: { id: value.id }, data: { startsAt, endsAt: localInstant(edit.endDate, minute(edit.end)), capacity: edit.capacity, updatedAt: version(shift.updatedAt) } });
          }
          return { ok: true, id: value.id };
        });
      }
      case "createPattern": {
        const value = parse(patternSchema, input);
        return await db.$transaction(tx => createPattern(tx, value));
      }
      case "generate": {
        const value = parse(generationSchema, input);
        return await db.$transaction(async tx => {
          const pattern = await lockPattern(tx, value.id);
          const message = await generate(tx, pattern, value.from, value.until);
          await tx.shiftPattern.update({ where: { id: value.id }, data: { updatedAt: version(pattern.updatedAt) } });
          return { ok: true, id: value.id, message };
        });
      }
      case "extendPattern": {
        const value = parse(extensionSchema, input);
        return await db.$transaction(async tx => {
          let pattern = await lockPattern(tx, value.id);
          checkVersion(pattern, value.updatedAt);
          if (!pattern.isActive) throw new SchedulingError("This schedule is no longer repeating. Create a new repeating schedule if needed.");
          if (pattern.validUntil && value.until > dateOnly(pattern.validUntil)) {
            pattern = await tx.shiftPattern.update({ where: { id: pattern.id }, data: { validUntil: dateValue(value.until) } });
          }
          const message = await generate(tx, pattern, value.from, value.until);
          await tx.shiftPattern.update({ where: { id: pattern.id }, data: { updatedAt: version(pattern.updatedAt) } });
          return { ok: true, id: pattern.id, message };
        });
      }
      case "shortenPattern":
      case "cancelPattern": {
        const value = command === "shortenPattern" ? parse(endSchema, input) : parse(versionSchema, input);
        return await db.$transaction(async tx => {
          const pattern = await lockPattern(tx, value.id);
          checkVersion(pattern, value.updatedAt);
          const until = command === "shortenPattern" ? parse(endSchema, input).validUntil : null;
          if (until && (until < dateOnly(pattern.validFrom) || (pattern.validUntil && until > dateOnly(pattern.validUntil)))) {
            throw new SchedulingError("Choose an earlier end date on or after the schedule start.", { validUntil: "The date must shorten the existing repeating range." });
          }
          // Lock every potentially affected shift in the same order as individual edits.
          // Actual start dates govern the calendar effect, including moved exceptions.
          const now = new Date();
          const boundary = until ? localInstant(addDays(until, 1), 0) : now;
          const locked = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Shift" WHERE "patternId" = ${pattern.id}::uuid AND status = 'SCHEDULED' AND "startsAt" > ${now} AND "startsAt" >= ${boundary} ORDER BY id FOR UPDATE`;
          const affected = await tx.shift.findMany({ where: { id: { in: locked.map(row => row.id) }, status: "SCHEDULED", startsAt: { gt: new Date() } }, include: { _count: { select: { assignments: true } } }, orderBy: { startsAt: "asc" } });
          const blocked = affected.filter(shift => shift._count.assignments > 0);
          if (blocked.length) throw new SchedulingError("No changes were saved. These future shifts have assignment history and need attention before changing this schedule.", undefined, blocked.map(shift => ({ id: shift.id, startsAt: shift.startsAt.toISOString() })));
          await tx.shift.updateMany({ where: { id: { in: affected.map(shift => shift.id) } }, data: { status: "CANCELLED", updatedAt: new Date(Math.max(Date.now(), ...affected.map(shift => shift.updatedAt.getTime() + 1))) } });
          await tx.shiftPattern.update({ where: { id: pattern.id }, data: { ...(until ? { validUntil: dateValue(until) } : { isActive: false }), updatedAt: version(pattern.updatedAt) } });
          return { ok: true, id: pattern.id, message: `${until ? "Repeating schedule shortened" : "Repeating schedule canceled"}. ${affected.length} future shift(s) canceled. Past shifts and assignment history were preserved.` };
        });
      }
      case "endPattern": {
        const value = parse(endSchema, input);
        return await db.$transaction(async tx => {
          const pattern = await lockPattern(tx, value.id);
          checkVersion(pattern, value.updatedAt);
          if (!pattern.isActive) throw new SchedulingError("This pattern is already retired.");
          if (value.validUntil < dateOnly(pattern.validFrom) || (pattern.validUntil && value.validUntil > dateOnly(pattern.validUntil))) throw new SchedulingError("The end must be on/after the start and must not extend the existing effective range.");
          await tx.shiftPattern.update({ where: { id: value.id }, data: { isActive: false, validUntil: dateValue(value.validUntil), updatedAt: version(pattern.updatedAt) } });
          return { ok: true, id: value.id, message: "Pattern ended. Generation is disabled immediately. All existing occurrences remain unchanged, including those after the effective end." };
        });
      }
      case "revisePattern": {
        const value = parse(revisionSchema, input);
        return await db.$transaction(async tx => {
          const old = await lockPattern(tx, value.id);
          checkVersion(old, value.updatedAt);
          if (!old.isActive) throw new SchedulingError("This pattern is retired. Create a separate new pattern if needed.");
          if (old.timeZone !== TIME_ZONE) throw new SchedulingError("Revision supports America/Phoenix only.");
          const shifts = await tx.shift.findMany({ where: { patternId: old.id }, select: { occurrenceDate: true, endsAt: true } });
          const earliest = nextCutover(dateOnly(old.validFrom), shifts);
          if (value.successor.validFrom < earliest) throw new SchedulingError(`Successor must start on or after ${earliest}. All represented dates and actual occupied dates must remain before the cutover.`);
          if (value.successor.definitionId !== old.definitionId) throw new SchedulingError("A revision must retain the shift definition.");
          const end = [addDays(value.successor.validFrom, -1), ...(old.validUntil ? [dateOnly(old.validUntil)] : [])].sort()[0];
          await tx.shiftPattern.update({ where: { id: old.id }, data: { isActive: false, validUntil: dateValue(end), updatedAt: version(old.updatedAt) } });
          const result = await createPattern(tx, value.successor);
          return { ...result, message: `Previous pattern ended ${end}; successor starts ${value.successor.validFrom}. Existing shifts and assignments remain unchanged. ${result.message}` };
        });
      }
      default: throw new SchedulingError("Invalid scheduling request.");
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.status === 401 ? "Please sign in before saving." : "You do not have permission to change scheduling." };
    if (error instanceof SchedulingError) return { ok: false, error: error.message, ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}), ...(error.blockedShifts ? { blockedShifts: error.blockedShifts } : {}) };
    if (error && typeof error === "object" && "code" in error && error.code === "P2003") return { ok: false, error: "This shift type has references and cannot be deleted. Deactivate it instead." };
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return { ok: false, error: "This record already exists or the start time conflicts with another occurrence of this pattern. Reload the schedule before trying again." };
    return { ok: false, error: "Unable to save scheduling changes. Please try again or reload the page." };
  }
}
