import Link from "next/link";
import { notFound } from "next/navigation";
import { getPattern } from "@/server/scheduling/service";
import { dateOnly, phoenixDate, TIME_ZONE } from "@/server/scheduling/dates";
import { readAdminPage } from "@/server/admin/page-access";
import { Notice } from "@/components/admin/Notice";
import { SchedulingNav, scheduleTime, ShiftState, repeatingTime, weekdays } from "@/components/admin/SchedulingDisplay";
import { PatternOperations } from "@/components/admin/SchedulingForms";
export default async function PatternPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const result = await readAdminPage(() => getPattern(id));
  if (result.error) return <Notice>{result.error}</Notice>;
  if (!result.data) notFound();
  const { pattern, canWrite } = result.data;
  const scheduled = pattern.shifts.filter(shift => shift.status === "SCHEDULED").sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const latest = scheduled.length ? phoenixDate(scheduled.at(-1)!.startsAt) : "";
  // Extension uses original dates, so moving a shift cannot hide a missing week.
  const latestIdentity = pattern.shifts.length ? dateOnly(pattern.shifts.at(-1)!.occurrenceDate!) : "";
  const validFrom = dateOnly(pattern.validFrom), validUntil = pattern.validUntil ? dateOnly(pattern.validUntil) : "";
  const canceled = pattern.shifts.filter(shift => shift.status === "CANCELLED");
  const visible = pattern.shifts.filter(shift => shift.status !== "CANCELLED").sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  function shiftList(shifts: typeof pattern.shifts) {
    return <ul className="mt-4 space-y-3">{shifts.map(shift => <li className="flex flex-wrap items-center gap-3 rounded border border-charcoal-700 p-4" key={shift.id}><Link className="text-peach-200 underline" href={`/admin/scheduling/${shift.id}`}>{scheduleTime.format(shift.startsAt)} to {scheduleTime.format(shift.endsAt)}</Link><ShiftState status={shift.status} /></li>)}</ul>;
  }
  return <><SchedulingNav /><h1 className="text-3xl font-semibold">{pattern.definition.name} · repeating schedule</h1>
    {saved === "1" && <div className="mt-5"><Notice>Repeating schedule saved.</Notice></div>}
    <div className="mt-6 space-y-3 rounded-lg border border-charcoal-700 p-5"><p>{pattern.isActive ? "Repeating" : "No longer repeating"} · {pattern.definition.role.name}</p><p>Repeats every {weekdays[pattern.dayOfWeek]}, {repeatingTime(pattern.startMinute, pattern.durationMinutes)} · {pattern.timeZone} · Capacity {pattern.capacity}</p><p>Repeats from {validFrom}</p><p>{validUntil ? `Repeats until ${validUntil} (inclusive)` : "No end date selected"}</p><p>{scheduled.length} shifts currently scheduled.</p><p>Latest scheduled date: {latest || "none"}</p><p className="text-cream-300">Only shifts added to the calendar are shown below. A repeating schedule with no end date still needs to be extended when more dates are needed.</p></div>
    {!canWrite && <p className="mt-5">Read-only access.</p>}
    {pattern.timeZone !== TIME_ZONE && <p className="mt-5">Adding shifts supports America/Phoenix only. The stored timezone has been preserved.</p>}
    {(!pattern.definition.isActive || !pattern.definition.role.isActive) && <p className="mt-5 text-cream-300">This shift type or its operational role is inactive. Existing shifts remain on record. Reactivate it before adding more shifts. <Link className="text-peach-200 underline" href={`/admin/scheduling/types/${pattern.definitionId}`}>View shift type</Link></p>}
    {canWrite && <PatternOperations id={id} updatedAt={pattern.updatedAt.toISOString()} validFrom={validFrom} validUntil={validUntil} latest={latestIdentity} allowGeneration={pattern.isActive && pattern.timeZone === TIME_ZONE && pattern.definition.isActive && pattern.definition.role.isActive} active={pattern.isActive} />}
    <h2 className="mt-8 text-xl font-semibold">Shifts on calendar</h2>
    {!visible.length ? <p className="mt-3">No shifts on calendar.</p> : shiftList(visible)}
    {!!canceled.length && <details className="mt-6"><summary className="cursor-pointer py-3">{canceled.length} canceled shift(s) on record</summary>{shiftList(canceled)}</details>}
  </>;
}
