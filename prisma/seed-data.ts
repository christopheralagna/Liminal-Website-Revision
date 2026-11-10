import type { PrismaClient } from "../src/generated/prisma/client";

// Reserved deterministic fixture namespace; names and dates are explicitly fictional.
export const demoId = (number: number) => `b4000000-0000-4000-8000-${String(number).padStart(12, "0")}`;
const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

export async function seedDemonstrationData(database: PrismaClient) {
  // Create missing fixtures only. Never reset, delete, or overwrite user edits on rerun.
  await database.$transaction(async (tx) => {
    for (const [i, name] of Array.from(["Demo Cafe", "Demo Setup", "Demo Art"].entries())) {
      await tx.volunteerRole.upsert({ where: { id: demoId(i + 1) }, update: {}, create: { id: demoId(i + 1), name } });
    }
    for (let i = 0; i < 12; i++) {
      const volunteerId = demoId(100 + i);
      await tx.volunteerProfile.upsert({
        where: { id: volunteerId }, update: {},
        create: {
          id: volunteerId, displayName: `Demo Volunteer ${String(i + 1).padStart(2, "0")}`,
          email: `demo-volunteer-${i + 1}@example.invalid`, status: i >= 10 ? "INACTIVE" : "ACTIVE",
          foodHandlerIssuedOn: i < 3 ? date("2026-12-01") : null,
          foodHandlerExpiresOn: i === 0 ? date("2028-12-01") : i === 1 ? date("2026-12-31") : null,
        },
      });
      const roleIds = [demoId(i < 4 ? 1 : 2), ...(i % 3 === 0 ? [demoId(3)] : [])];
      for (const roleId of roleIds) {
        await tx.volunteerRoleMembership.upsert({ where: { volunteerId_roleId: { volunteerId, roleId } }, update: {}, create: { volunteerId, roleId } });
      }
      for (const dayOfWeek of [1, 3]) {
        const id = demoId(600 + i * 2 + (dayOfWeek === 1 ? 0 : 1));
        await tx.availability.upsert({ where: { id }, update: {}, create: {
          id, volunteerId, dayOfWeek, startMinute: i % 2 === 0 ? 480 : 540, endMinute: i % 2 === 0 ? 1020 : 1080,
          validFrom: date("2027-01-01"), validUntil: date("2027-03-31"),
        } });
      }
    }
    for (let i = 0; i < 2; i++) {
      const definitionId = demoId(200 + i), patternId = demoId(300 + i), shiftId = demoId(400 + i);
      await tx.shiftDefinition.upsert({ where: { id: definitionId }, update: {}, create: { id: definitionId, name: i === 0 ? "Demo Cafe Morning" : "Demo Setup Morning", roleId: demoId(i + 1) } });
      await tx.shiftPattern.upsert({ where: { id: patternId }, update: {}, create: {
        id: patternId, definitionId, dayOfWeek: i === 0 ? 1 : 3, startMinute: 540, durationMinutes: 180, capacity: 3,
        validFrom: date("2027-01-01"), validUntil: date("2027-03-31"),
      } });
      const day = i === 0 ? "2027-01-04" : "2027-01-06";
      await tx.shift.upsert({ where: { id: shiftId }, update: {}, create: {
        id: shiftId, definitionId, patternId, occurrenceDate: date(day), startsAt: new Date(`${day}T16:00:00Z`), endsAt: new Date(`${day}T19:00:00Z`), capacity: 3,
      } });
      for (let j = 0; j < 2; j++) {
        const volunteerId = demoId(i === 0 ? 100 + j : 104 + j);
        await tx.shiftAssignment.upsert({ where: { shiftId_volunteerId: { shiftId, volunteerId } }, update: {}, create: { id: demoId(500 + i * 2 + j), shiftId, volunteerId } });
      }
    }
  });
}
