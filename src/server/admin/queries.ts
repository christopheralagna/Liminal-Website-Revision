import "server-only";
import { getDatabase } from "../db";
import { requirePermission } from "../auth/permissions";

// Each operation checks current permissions, even when called outside a page.
export async function getDashboard() {
  await requirePermission("volunteers:read");
  await requirePermission("scheduling:read");
  const db = getDatabase();
  const [activeVolunteers, activeRoles, scheduledShifts, assignedVolunteers] = await db.$transaction([
    db.volunteerProfile.count({ where: { status: "ACTIVE" } }),
    db.volunteerRole.count({ where: { isActive: true } }),
    db.shift.count({ where: { status: "SCHEDULED" } }),
    db.shiftAssignment.count({ where: { status: "ASSIGNED", shift: { status: "SCHEDULED" } } }),
  ]);
  return { activeVolunteers, activeRoles, scheduledShifts, assignedVolunteers };
}

export async function getVolunteers() {
  await requirePermission("volunteers:read");
  return getDatabase().volunteerProfile.findMany({
    orderBy: [{ displayName: "asc" }, { id: "asc" }],
    select: { id: true, displayName: true, status: true,
      roles: { orderBy: { role: { name: "asc" } }, select: { role: { select: { name: true, isActive: true } } } } },
  });
}

export async function getShifts() {
  await requirePermission("scheduling:read");
  return getDatabase().shift.findMany({
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    select: { id: true, startsAt: true, endsAt: true, capacity: true, status: true,
      definition: { select: { name: true, role: { select: { name: true } } } },
      assignments: { where: { status: { not: "CANCELLED" } }, orderBy: { volunteer: { displayName: "asc" } },
        select: { id: true, status: true, volunteer: { select: { displayName: true } } } } },
  });
}
