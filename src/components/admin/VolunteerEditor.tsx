import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readAdminPage } from "@/server/admin/page-access";
import { getVolunteerEditor } from "@/server/volunteers/service";
import { fromMinute, type VolunteerInput } from "@/server/volunteers/validation";
import { Notice } from "./Notice";
import { VolunteerForm } from "./VolunteerForm";

export async function VolunteerEditor({ id, saved = false }: { id?: string; saved?: boolean }) {
  const result = await readAdminPage(() => getVolunteerEditor(id));
  if (result.error) return <Notice>{result.error}</Notice>;
  if (!result.data) notFound();
  const { volunteer, roles, canWrite } = result.data;
  if (!id && !canWrite) return <Notice>You do not have permission to create volunteers.</Notice>;
  const date = (value: Date | null) => value?.toISOString().slice(0, 10) || "";
  const initial: VolunteerInput = volunteer ? {
    id: volunteer.id, updatedAt: volunteer.updatedAt.toISOString(), displayName: volunteer.displayName,
    email: volunteer.email || "", status: volunteer.status,
    foodHandlerIssuedOn: date(volunteer.foodHandlerIssuedOn), foodHandlerExpiresOn: date(volunteer.foodHandlerExpiresOn),
    roleIds: volunteer.roles.map(role => role.roleId),
    availability: volunteer.availability.map(window => ({ id: window.id, dayOfWeek: window.dayOfWeek, start: fromMinute(window.startMinute), end: fromMinute(window.endMinute), timeZone: window.timeZone, validFrom: date(window.validFrom), validUntil: date(window.validUntil) })),
  } : { id: randomUUID(), updatedAt: "", displayName: "", email: "", status: "ACTIVE", foodHandlerIssuedOn: "", foodHandlerExpiresOn: "", roleIds: [], availability: [] };
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return <>
    <Link href="/admin/volunteers" className="underline">Back to volunteers</Link>
    <h1 className="mt-5 text-3xl font-semibold">{volunteer ? volunteer.displayName : "Create volunteer"}</h1>
    {saved && <div className="mt-4"><Notice>Volunteer information saved.</Notice></div>}
    <VolunteerForm key={`${initial.id}:${initial.updatedAt}`} initial={initial} roles={roles} canWrite={canWrite} mode={id ? "update" : "create"} today={today} />
  </>;
}
