import { randomUUID } from "node:crypto";
import { getSchedulingCatalog } from "@/server/scheduling/service";
import { phoenixDate } from "@/server/scheduling/dates";
import { readAdminPage } from "@/server/admin/page-access";
import { Notice } from "@/components/admin/Notice";
import { SchedulingNav } from "@/components/admin/SchedulingDisplay";
import { PatternForm } from "@/components/admin/SchedulingForms";
export default async function NewPatternPage() {
  const result = await readAdminPage(getSchedulingCatalog);
  if (!result.data) return <Notice>{result.error}</Notice>;
  if (!result.data.canWrite) return <Notice>You do not have permission to create repeating schedules.</Notice>;
  return <><SchedulingNav /><h1 className="text-3xl font-semibold">Create repeating schedule</h1><PatternForm id={randomUUID()} definitions={result.data.definitions} roles={result.data.roles} initial={{ definitionId: "", dayOfWeek: 0, start: "", durationMinutes: 60, capacity: 1, validFrom: phoenixDate(), validUntil: "" }} /></>;
}
