import { randomUUID } from "node:crypto";
import { getSchedulingCatalog } from "@/server/scheduling/service";
import { readAdminPage } from "@/server/admin/page-access";
import { SchedulingNav } from "@/components/admin/SchedulingDisplay";
import { DefinitionCreator } from "@/components/admin/SchedulingForms";
import { Notice } from "@/components/admin/Notice";
export default async function NewShiftTypePage() {
  const result = await readAdminPage(getSchedulingCatalog);
  if (!result.data) return <Notice>{result.error}</Notice>;
  if (!result.data.canWrite) return <Notice>You do not have permission to create shift types.</Notice>;
  return <><SchedulingNav /><h1 className="text-3xl font-semibold">Create shift type</h1><DefinitionCreator id={randomUUID()} roles={result.data.roles} /></>;
}
