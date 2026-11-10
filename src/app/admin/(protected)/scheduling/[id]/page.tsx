import Link from "next/link";
import { notFound } from "next/navigation";
import { getShift } from "@/server/scheduling/service";
import { dateOnly, phoenixDate } from "@/server/scheduling/dates";
import { readAdminPage } from "@/server/admin/page-access";
import { Notice } from "@/components/admin/Notice";
import { SchedulingNav, scheduleTime, ShiftState } from "@/components/admin/SchedulingDisplay";
import { CancelShift, ShiftForm } from "@/components/admin/SchedulingForms";
const localTime = (date: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: "America/Phoenix", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
export default async function ShiftPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const result = await readAdminPage(() => getShift(id));
  if (result.error) return <Notice>{result.error}</Notice>;
  if (!result.data) notFound();
  const { shift, canWrite, restriction } = result.data;
  return <><SchedulingNav /><h1 className="text-3xl font-semibold">{shift.definition.name}</h1>
    {saved === "1" && <div className="mt-5"><Notice>Shift saved.</Notice></div>}
    <div className="mt-6 space-y-3 rounded-lg border border-charcoal-700 p-5"><p>Required operational role: {shift.definition.role.name}</p><p>{scheduleTime.format(shift.startsAt)} to {scheduleTime.format(shift.endsAt)} · America/Phoenix</p><p>Capacity: {shift.capacity}</p><ShiftState status={shift.status} />
      <div>{shift.patternId ? <><Link className="text-peach-200 underline" href={`/admin/scheduling/patterns/${shift.patternId}`}>Repeating schedule</Link><details className="mt-3"><summary className="cursor-pointer">Scheduling record details</summary>Original calendar date: {dateOnly(shift.occurrenceDate!)}, in {shift.pattern!.timeZone}</details></> : "One-time shift"}</div>
    </div>
    {!canWrite && <p className="mt-5">Read-only access.</p>}
    {restriction && <p className="mt-5 text-cream-300">{restriction}</p>}
    {canWrite && !restriction && <><ShiftForm key={`${id}:${shift.updatedAt.toISOString()}`} id={id} updatedAt={shift.updatedAt.toISOString()} initial={{ date: phoenixDate(shift.startsAt), endDate: phoenixDate(shift.endsAt), start: localTime(shift.startsAt), end: localTime(shift.endsAt), capacity: shift.capacity }} /><CancelShift id={id} updatedAt={shift.updatedAt.toISOString()} /></>}
    <h2 className="mt-8 text-xl font-semibold">Assignment history (read-only)</h2>
    {shift.assignments.length ? <ul className="mt-4 space-y-2">{shift.assignments.map(assignment => <li key={assignment.id}>{assignment.volunteer.displayName} · {assignment.status.toLowerCase()}</li>)}</ul> : <p className="mt-3 text-cream-300">No assignments recorded.</p>}
  </>;
}
