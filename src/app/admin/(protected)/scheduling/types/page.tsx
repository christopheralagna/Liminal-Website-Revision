import Link from "next/link";
import { getShiftTypes } from "@/server/scheduling/service";
import { readAdminPage } from "@/server/admin/page-access";
import { SchedulingNav } from "@/components/admin/SchedulingDisplay";
import { Notice } from "@/components/admin/Notice";
export default async function ShiftTypesPage({ searchParams }: { searchParams?: Promise<{ deleted?: string }> }) {
  const query = await searchParams;
  const result = await readAdminPage(getShiftTypes);
  if (!result.data) return <Notice>{result.error}</Notice>;
  const { definitions, canWrite } = result.data;
  const groups = Array.from(new Map(definitions.map(definition => [definition.role.id, definition.role])).values());
  return <><SchedulingNav /><h1 className="text-3xl font-semibold">Shift types</h1><p className="mt-3 text-cream-300">Reusable work labels, organized under their operational roles. Inactive types remain on existing schedules.</p>
    {query?.deleted === "1" && <div className="mt-5"><Notice>Unused shift type deleted.</Notice></div>}
    {canWrite ? <Link href="/admin/scheduling/types/new" className="my-6 inline-block rounded border border-charcoal-500 px-4 py-3">Create shift type</Link> : <p className="mt-5">Read-only access.</p>}
    {!definitions.length && <div className="mt-6"><Notice>No shift types recorded.</Notice></div>}
    {groups.map(role => <section className="mt-6 rounded-lg border border-charcoal-700 p-5" key={role.id}><h2 className="text-xl font-semibold">{role.name}{!role.isActive && " (inactive role)"}</h2><ul className="mt-4 space-y-3">{definitions.filter(definition => definition.role.id === role.id).map(definition => <li className="flex flex-wrap justify-between gap-3 border-t border-charcoal-700 pt-3" key={definition.id}><Link className="text-peach-200 underline" href={`/admin/scheduling/types/${definition.id}`}>{definition.name}</Link><span className="text-sm text-cream-300">{definition.isActive ? "Active" : "Inactive"} · {definition._count.shifts} shifts · {definition._count.patterns} repeating schedules</span></li>)}</ul></section>)}
  </>;
}
