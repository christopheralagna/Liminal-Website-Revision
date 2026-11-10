import { randomUUID } from "node:crypto";
import { getSchedulingCatalog } from "@/server/scheduling/service";
import { phoenixDate } from "@/server/scheduling/dates";
import { readAdminPage } from "@/server/admin/page-access";
import { Notice } from "@/components/admin/Notice";
import { SchedulingNav } from "@/components/admin/SchedulingDisplay";
import { ShiftForm } from "@/components/admin/SchedulingForms";
export default async function NewShiftPage() {
  const result = await readAdminPage(getSchedulingCatalog);
  if (!result.data) return <Notice>{result.error}</Notice>;
  if (!result.data.canWrite) return <Notice>You do not have permission to create shifts.</Notice>;
  const today = phoenixDate();
  return <><SchedulingNav /><h1 className="text-3xl font-semibold">Create one-time shift</h1><ShiftForm id={randomUUID()} definitions={result.data.definitions} roles={result.data.roles} initial={{ date: today, endDate: today, start: "", end: "", capacity: 1 }} /></>;
}
