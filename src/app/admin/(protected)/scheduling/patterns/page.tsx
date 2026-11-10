import Link from "next/link";
import { getPatterns } from "@/server/scheduling/service";
import { dateOnly, phoenixDate } from "@/server/scheduling/dates";
import { readAdminPage } from "@/server/admin/page-access";
import { Notice } from "@/components/admin/Notice";
import { SchedulingNav, repeatingTime, weekdays } from "@/components/admin/SchedulingDisplay";
export default async function PatternsPage() {
  const result = await readAdminPage(getPatterns);
  return <><SchedulingNav /><h1 className="text-3xl font-semibold">Repeating schedules</h1><p className="mt-3 text-cream-300">Manage repeating shifts and add upcoming dates to the calendar.</p>
    {!result.data ? <div className="mt-6"><Notice>{result.error}</Notice></div> : <>
      {result.data.canWrite && <Link className="my-6 inline-block rounded border border-charcoal-500 px-4 py-3" href="/admin/scheduling/patterns/new">Create repeating schedule</Link>}
      {!result.data.patterns.length && <Notice>No repeating schedules recorded.</Notice>}
      <ul className="mt-5 space-y-5">{result.data.patterns.map(pattern => <li key={pattern.id} className="rounded-lg border border-charcoal-700 p-5"><Link href={`/admin/scheduling/patterns/${pattern.id}`} className="font-semibold text-peach-200 underline">{pattern.definition.name}</Link><p className="mt-2">Repeats every {weekdays[pattern.dayOfWeek]}, {repeatingTime(pattern.startMinute, pattern.durationMinutes)} · {pattern.timeZone}</p><p className="mt-2">{pattern.isActive ? "Repeating" : "No longer repeating"} · Repeats from {dateOnly(pattern.validFrom)} · {pattern.validUntil ? `Repeats until ${dateOnly(pattern.validUntil)}` : "No end date"}</p><p className="mt-2 text-cream-300">{pattern._count.shifts} shifts currently scheduled · Latest scheduled date: {pattern.shifts[0] ? phoenixDate(pattern.shifts[0].startsAt) : "none"}</p></li>)}</ul>
    </>}
  </>;
}
