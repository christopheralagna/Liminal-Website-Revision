import "server-only";
import { z } from "zod";
import { getDatabase } from "../db";
import { requirePermission } from "../auth/permissions";
import { AuthorizationError } from "../auth/authorization";
import { volunteerSchema, toMinute, type SaveResult } from "./validation";

class VolunteerError extends Error {}
const dateValue = (value: string) => value ? new Date(`${value}T00:00:00.000Z`) : null;

export async function getVolunteerEditor(id?: string) {
  const user = await requirePermission("volunteers:read");
  if (id && !z.uuid().safeParse(id).success) return null;
  const db = getDatabase();
  const volunteer = id ? await db.volunteerProfile.findUnique({ where: { id }, select: {
    id: true, displayName: true, email: true, status: true, updatedAt: true,
    foodHandlerIssuedOn: true, foodHandlerExpiresOn: true,
    roles: { select: { roleId: true } },
    availability: { orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }, { validFrom: "asc" }], select: {
      id: true, dayOfWeek: true, startMinute: true, endMinute: true, timeZone: true, validFrom: true, validUntil: true,
    } },
  } }) : null;
  if (id && !volunteer) return null;
  const roles = await db.volunteerRole.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, isActive: true } });
  return { volunteer, roles, canWrite: user.role === "ADMIN" || user.role === "COORDINATOR" };
}

// Every direct call independently checks live session permissions before inspecting input.
export async function saveVolunteer(mode: "create" | "update", input: unknown): Promise<SaveResult> {
  try {
    await requirePermission("volunteers:write");
    const parsed = volunteerSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Please correct the following fields.", issues: parsed.error.issues.map(issue => `${issue.path[0] === "availability" ? `Availability window ${typeof issue.path[1] === "number" ? issue.path[1] + 1 : ""}` : ({ displayName: "Name", email: "Email", status: "Status", roleIds: "Operational roles", foodHandlerIssuedOn: "Certificate issuance", foodHandlerExpiresOn: "Certificate expiration", id: "Volunteer record", updatedAt: "Record version" } as Record<string, string>)[String(issue.path[0])] || "Volunteer information"}: ${issue.message}`) };
    const value = parsed.data;
    if (mode !== "create" && mode !== "update") throw new VolunteerError("Invalid save request.");
    if (mode === "update" && !value.updatedAt) throw new VolunteerError("Reload this volunteer before saving.");
    const db = getDatabase();
    await db.$transaction(async tx => {
      const profile = {
        displayName: value.displayName, email: value.email || null, status: value.status,
        foodHandlerIssuedOn: dateValue(value.foodHandlerIssuedOn), foodHandlerExpiresOn: dateValue(value.foodHandlerExpiresOn),
      };
      if (mode === "create") {
        if (await tx.volunteerProfile.findUnique({ where: { id: value.id }, select: { id: true } })) throw new VolunteerError("This volunteer has already been created. Open their record from the volunteer list.");
        await tx.volunteerProfile.create({ data: { id: value.id, ...profile } });
      } else {
        // Conditional update locks the profile and prevents stale forms overwriting newer saves.
        const changed = await tx.volunteerProfile.updateMany({ where: { id: value.id, updatedAt: new Date(value.updatedAt) }, data: { ...profile, updatedAt: new Date(Math.max(Date.now(), new Date(value.updatedAt).getTime() + 1)) } });
        if (!changed.count) throw new VolunteerError("This volunteer was changed or no longer exists. Reload the page before saving.");
      }
      const roles = await tx.volunteerRole.findMany({ where: { id: { in: value.roleIds } }, select: { id: true } });
      if (roles.length !== value.roleIds.length) throw new VolunteerError("A selected operational role no longer exists. Reload and try again.");
      await tx.volunteerRoleMembership.deleteMany({ where: { volunteerId: value.id, roleId: { notIn: value.roleIds } } });
      await tx.volunteerRoleMembership.createMany({ data: value.roleIds.map(roleId => ({ volunteerId: value.id, roleId })), skipDuplicates: true });
      // IDs belonging to another volunteer must never be updated or reassigned.
      const windowIds = value.availability.map(window => window.id);
      const existingWindows = await tx.availability.findMany({ where: { id: { in: windowIds } }, select: { id: true, volunteerId: true } });
      if (existingWindows.some(window => window.volunteerId !== value.id)) throw new VolunteerError("An availability window is invalid. Reload and try again.");
      await tx.availability.deleteMany({ where: { volunteerId: value.id, id: { notIn: windowIds } } });
      for (const window of value.availability) {
        const data = { dayOfWeek: window.dayOfWeek, startMinute: toMinute(window.start), endMinute: toMinute(window.end), timeZone: window.timeZone, validFrom: dateValue(window.validFrom)!, validUntil: dateValue(window.validUntil) };
        if (existingWindows.some(existing => existing.id === window.id)) {
          await tx.availability.updateMany({ where: { id: window.id, volunteerId: value.id }, data });
        } else {
          // Create rather than upsert: a concurrent ID collision must fail, never update another record.
          await tx.availability.create({ data: { id: window.id, volunteerId: value.id, ...data } });
        }
      }
      // Account links and historical shift assignments are deliberately outside this write.
    });
    return { ok: true, id: value.id };
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.status === 401 ? "Please sign in before saving." : "You do not have permission to change volunteer information." };
    if (error instanceof VolunteerError) return { ok: false, error: error.message };
    return { ok: false, error: "Unable to save volunteer information. Please try again. If the problem continues, reload the page." };
  }
}
