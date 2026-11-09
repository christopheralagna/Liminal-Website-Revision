import "dotenv/config";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { Pool, type PoolClient } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readDatabaseUrl } from "../../src/server/database/environment";
import { verifyTarget } from "../../scripts/database-target";
import { createDatabaseClient } from "../../src/server/database/client";
import { demoId, seedDemonstrationData } from "../../prisma/seed-data";

let pool: Pool;
let poolFailure: Error | undefined;
let database: ReturnType<typeof createDatabaseClient>;
beforeAll(async () => {
  // Missing/incorrect test URLs fail, never skip or fall back to development.
  const url = readDatabaseUrl(process.env, "TEST_DATABASE_URL");
  await verifyTarget(url, "test");
  const migration = spawnSync(process.execPath, [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy", "--config", "prisma.config.ts"], {
    env: { ...process.env, DATABASE_URL: url }, encoding: "utf8",
  });
  if (migration.status !== 0) throw new Error("Test migration failed; test database was not reset.");
  pool = new Pool({ connectionString: url, connectionTimeoutMillis: 5000 });
  // pg emits an idle client as a second error argument; never let a test reporter serialize its credentials.
  pool.on("error", () => { poolFailure = new Error("The isolated test database connection was interrupted."); });
  database = createDatabaseClient(url);
});
afterAll(async () => { await database?.$disconnect(); await pool?.end(); if (poolFailure) throw poolFailure; });

async function rolledBack(run: (client: PoolClient) => Promise<void>) {
  const client = await pool.connect();
  try { await client.query("BEGIN"); await run(client); }
  finally { await client.query("ROLLBACK"); client.release(); }
}
const insertRole = (client: PoolClient, id: string) => client.query('INSERT INTO "VolunteerRole" (id,name,"updatedAt") VALUES ($1,$2,now())', [id, `Test Role ${id}`]);
const insertVolunteer = (client: PoolClient, id: string) => client.query('INSERT INTO "VolunteerProfile" (id,"displayName","updatedAt") VALUES ($1,$2,now())', [id, `Test Volunteer ${id}`]);

describe("isolated PostgreSQL foundation", () => {
  it("connects to the test identity and applies the committed migration", async () => {
    const identity = await pool.query('SELECT current_database() AS name');
    expect(identity.rows[0].name).toBe("liminal_test");
    const migrations = await pool.query('SELECT migration_name, finished_at FROM "_prisma_migrations" WHERE rolled_back_at IS NULL');
    expect(migrations.rows).toEqual([expect.objectContaining({ migration_name: "20261108000000_initial", finished_at: expect.any(Date) })]);
    const tables = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations'");
    expect(tables.rows.map(r => r.tablename).sort()).toEqual(["Account", "Availability", "Session", "Shift", "ShiftAssignment", "ShiftDefinition", "ShiftPattern", "User", "Verification", "VolunteerProfile", "VolunteerRole", "VolunteerRoleMembership"].sort());
  });

  it("seeds repeatably, preserves unrelated records and user edits, and creates no credentials", async () => {
    await seedDemonstrationData(database);
    const counts = async () => ({ volunteers: await database.volunteerProfile.count({ where: { id: { in: Array.from({ length: 12 }, (_, i) => demoId(100 + i)) } } }), assignments: await database.shiftAssignment.count(), availability: await database.availability.count() });
    const before = await counts();
    expect(before.volunteers).toBe(12);
    expect(before.assignments).toBeGreaterThanOrEqual(4);
    const original = await database.volunteerProfile.findUniqueOrThrow({ where: { id: demoId(100) } });
    const extraId = randomUUID();
    try {
      await database.volunteerProfile.create({ data: { id: extraId, displayName: "Test Unrelated Record" } });
      await database.volunteerProfile.update({ where: { id: demoId(100) }, data: { displayName: "Test Preserved Edit" } });
      await seedDemonstrationData(database);
      expect(await counts()).toEqual(before);
      expect((await database.volunteerProfile.findUniqueOrThrow({ where: { id: demoId(100) } })).displayName).toBe("Test Preserved Edit");
      expect(await database.volunteerProfile.findUnique({ where: { id: extraId } })).not.toBeNull();
      expect(await database.user.count()).toBe(0);
      expect(await database.account.count()).toBe(0);
      expect(await database.session.count()).toBe(0);
    } finally {
      await database.volunteerProfile.update({ where: { id: demoId(100) }, data: { displayName: original.displayName } });
      await database.volunteerProfile.delete({ where: { id: extraId } });
    }
  });

  it("performs Prisma create/read/update with memberships and rolls back related writes", async () => {
    const id = randomUUID();
    const rollback = new Error("intentional test rollback");
    await expect(database.$transaction(async tx => {
      const volunteer = await tx.volunteerProfile.create({ data: { id, displayName: "Test CRUD", roles: { create: { role: { create: { name: `Test CRUD ${id}` } } } } }, include: { roles: true } });
      expect(volunteer.roles).toHaveLength(1);
      await tx.volunteerProfile.update({ where: { id }, data: { status: "INACTIVE" } });
      expect((await tx.volunteerProfile.findUniqueOrThrow({ where: { id } })).status).toBe("INACTIVE");
      throw rollback;
    })).rejects.toBe(rollback);
    expect(await database.volunteerProfile.findUnique({ where: { id } })).toBeNull();
    expect(await database.volunteerRole.findUnique({ where: { name: `Test CRUD ${id}` } })).toBeNull();
  });

  it("enforces membership uniqueness and restrictive volunteer deletion", async () => {
    await rolledBack(async client => {
      const volunteer = randomUUID(), role = randomUUID();
      await insertRole(client, role); await insertVolunteer(client, volunteer);
      await client.query('INSERT INTO "VolunteerRoleMembership" ("volunteerId","roleId") VALUES ($1,$2)', [volunteer, role]);
      await client.query("SAVEPOINT check_duplicate");
      await expect(client.query('INSERT INTO "VolunteerRoleMembership" ("volunteerId","roleId") VALUES ($1,$2)', [volunteer, role])).rejects.toMatchObject({ code: "23505" });
      await client.query("ROLLBACK TO SAVEPOINT check_duplicate");
      await expect(client.query('DELETE FROM "VolunteerProfile" WHERE id=$1', [volunteer])).rejects.toMatchObject({ code: "23503" });
    });
  });

  it("enforces foreign keys, required fields and role enum", async () => {
    for (const [sql, params, code] of [
      ['INSERT INTO "VolunteerRoleMembership" ("volunteerId","roleId") VALUES ($1,$2)', [randomUUID(), randomUUID()], "23503"],
      ['INSERT INTO "VolunteerProfile" (id,"updatedAt") VALUES ($1,now())', [randomUUID()], "23502"],
      ['INSERT INTO "User" (name,email,role,"updatedAt") VALUES (\'Test\',\'test@example.invalid\',\'ROOT\',now())', [], "22P02"],
    ] as const) await rolledBack(async client => { await expect(client.query(sql, [...params])).rejects.toMatchObject({ code }); });
  });

  it.each([
    ["dayOfWeek", 7], ["dayOfWeek", -1], ["startMinute", -1], ["endMinute", 1441], ["endMinute", 480],
  ])("rejects invalid availability %s=%s", async (field, value) => {
    await rolledBack(async client => {
      const id = randomUUID(); await insertVolunteer(client, id);
      const values = { dayOfWeek: 1, startMinute: 480, endMinute: 600, [field]: value };
      await expect(client.query('INSERT INTO "Availability" (id,"volunteerId","dayOfWeek","startMinute","endMinute","validFrom","updatedAt") VALUES ($1,$2,$3,$4,$5,\'2027-01-01\',now())', [randomUUID(), id, values.dayOfWeek, values.startMinute, values.endMinute])).rejects.toMatchObject({ code: "23514" });
    });
  });

  it("rejects reversed availability and certificate dates but permits partial certificate records", async () => {
    await rolledBack(async client => {
      const id = randomUUID(); await insertVolunteer(client, id);
      await client.query('UPDATE "VolunteerProfile" SET "foodHandlerExpiresOn"=\'2027-01-01\' WHERE id=$1', [id]);
      await expect(client.query('UPDATE "VolunteerProfile" SET "foodHandlerIssuedOn"=\'2027-02-01\' WHERE id=$1', [id])).rejects.toMatchObject({ code: "23514" });
    });
    await rolledBack(async client => {
      const id = randomUUID(); await insertVolunteer(client, id);
      await expect(client.query('INSERT INTO "Availability" (id,"volunteerId","dayOfWeek","startMinute","endMinute","validFrom","validUntil","updatedAt") VALUES ($1,$2,1,480,600,\'2027-02-01\',\'2027-01-01\',now())', [randomUUID(), id])).rejects.toMatchObject({ code: "23514" });
    });
  });

  it.each([
    ["dayOfWeek", 7], ["startMinute", 1440], ["durationMinutes", 0], ["durationMinutes", 1441], ["capacity", 0],
  ])("rejects invalid recurrence %s=%s", async (field, value) => {
    await seedDemonstrationData(database);
    await rolledBack(async client => {
      // Column names come only from the fixed test cases above, never user input.
      await expect(client.query(`UPDATE "ShiftPattern" SET "${field}"=$1 WHERE id=$2`, [value, demoId(300)])).rejects.toMatchObject({ code: "23514" });
    });
  });

  it("rejects reversed recurrence dates and nonpositive shift capacity/intervals", async () => {
    for (const sql of [
      'UPDATE "ShiftPattern" SET "validUntil"=\'2020-01-01\' WHERE id=$1',
      'UPDATE "Shift" SET capacity=0 WHERE id=$1',
      'UPDATE "Shift" SET "endsAt"="startsAt" WHERE id=$1',
    ]) await rolledBack(async client => { await expect(client.query(sql, [sql.includes('"ShiftPattern"') ? demoId(300) : demoId(400)])).rejects.toMatchObject({ code: "23514" }); });
  });

  it("keeps assignments and recurrence occurrences unique; permits multiple volunteers", async () => {
    expect(await database.shiftAssignment.count({ where: { shiftId: demoId(400) } })).toBe(2);
    await expect(database.shiftAssignment.create({ data: { shiftId: demoId(400), volunteerId: demoId(100) } })).rejects.toMatchObject({ code: "P2002" });
    await expect(database.shift.create({ data: { definitionId: demoId(200), patternId: demoId(300), startsAt: new Date("2027-01-04T16:00:00Z"), endsAt: new Date("2027-01-04T19:00:00Z"), capacity: 2 } })).rejects.toMatchObject({ code: "P2002" });
    await expect(database.shift.delete({ where: { id: demoId(400) } })).rejects.toMatchObject({ code: "P2003" });
  });

  it("supports auth UUID defaults, unique identities and cascade/set-null deletion without credentials", async () => {
    await rolledBack(async client => {
      const { rows } = await client.query('INSERT INTO "User" (name,email,"updatedAt") VALUES (\'Test\',$1,now()) RETURNING id,role', [`test-${randomUUID()}@example.invalid`]);
      expect(rows[0].id).toMatch(/^[0-9a-f-]{36}$/); expect(rows[0].role).toBe("VIEWER");
      const id = rows[0].id;
      const volunteerId = randomUUID();
      await client.query('INSERT INTO "VolunteerProfile" (id,"userId","displayName","updatedAt") VALUES ($1,$2,\'Test Linked\',now())', [volunteerId, id]);
      await client.query('INSERT INTO "Account" ("userId","accountId","providerId","updatedAt") VALUES ($1,$2,\'test-only-no-credential\',now())', [id, id]);
      await client.query('DELETE FROM "User" WHERE id=$1', [id]);
      expect((await client.query('SELECT "userId" FROM "VolunteerProfile" WHERE id=$1', [volunteerId])).rows[0].userId).toBeNull();
      expect((await client.query('SELECT * FROM "Account" WHERE "userId"=$1', [id])).rowCount).toBe(0);
    });
    await rolledBack(async client => {
      await expect(client.query('INSERT INTO "User" (name,email,"updatedAt") VALUES (\'Test\',\'Mixed@Example.invalid\',now())')).rejects.toMatchObject({ code: "23514" });
    });
  });
});
