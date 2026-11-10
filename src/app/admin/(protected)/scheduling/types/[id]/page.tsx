import { notFound } from "next/navigation";
import { getShiftType } from "@/server/scheduling/service";
import { readAdminPage } from "@/server/admin/page-access";
import { SchedulingNav } from "@/components/admin/SchedulingDisplay";
import { DefinitionEditor } from "@/components/admin/SchedulingForms";
import { Notice } from "@/components/admin/Notice";
export default async function ShiftTypePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const result = await readAdminPage(() => getShiftType(id));
  if (result.error) return <Notice>{result.error}</Notice>;
  if (!result.data) notFound();
  const { definition, canWrite } = result.data;
  return <><SchedulingNav /><h1 className="text-3xl font-semibold">{definition.name}</h1><p className="mt-3">Operational role: {definition.role.name} · {definition.isActive ? "Active" : "Inactive"}</p>
    {saved === "1" && <div className="mt-5"><Notice>Shift type saved.</Notice></div>}
    <DefinitionEditor key={definition.updatedAt.toISOString()} canWrite={canWrite} definition={{ id: definition.id, name: definition.name, isActive: definition.isActive, updatedAt: definition.updatedAt.toISOString(), role: { name: definition.role.name, isActive: definition.role.isActive }, shiftCount: definition._count.shifts, patternCount: definition._count.patterns }} />
  </>;
}
