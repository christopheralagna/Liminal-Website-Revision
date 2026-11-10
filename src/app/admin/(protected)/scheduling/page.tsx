import Link from "next/link";
import { getSchedule, getSchedulingFilters } from "@/server/scheduling/service";
import { addDays, phoenixDate, dayNumber } from "@/server/scheduling/dates";
import { scheduleQuerySchema, selectedIds } from "@/server/scheduling/validation";
import { shiftsOnDay, startOfWeek, weekDates } from "@/server/scheduling/calendar";
import { readAdminPage } from "@/server/admin/page-access";
import { ScheduleFilters } from "@/components/admin/ScheduleFilters";
import { Notice } from "@/components/admin/Notice";
import { SchedulingNav, scheduleTime, ShiftState, weekdays } from "@/components/admin/SchedulingDisplay";

type Query = { view?: string; date?: string; from?: string; until?: string; definitionId?: string | string[]; roleId?: string | string[]; canceled?: string; page?: string };
const clock = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", hour: "numeric", minute: "2-digit" });
const headingDate = (date: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00Z`));
export default async function SchedulingPage({ searchParams }: { searchParams?: Promise<Query> }) {
  const parsed = scheduleQuerySchema.safeParse(await searchParams || {});
  if (!parsed.success) {
    const access = await readAdminPage(getSchedulingFilters);
    return <><SchedulingNav /><Notice>{access.error || "Check the viewing dates, filter selections, and page number in the URL."}</Notice></>;
  }
  const query = parsed.data;
  const list = query.view === "list";
  const date = query.date || query.from || phoenixDate();
  const from = list ? query.from || date : startOfWeek(date);
  const until = list ? query.until || addDays(date, 55) : addDays(from, 6);
  const page = Number(query.page || "1");
  const filters = { definitionIds: selectedIds(query.definitionId), roleIds: selectedIds(query.roleId), showCanceled: query.canceled === "1", page };
  const [result, catalog] = await Promise.all([readAdminPage(() => getSchedule(from, until, filters)), readAdminPage(getSchedulingFilters)]);
  function href(changes: Partial<Omit<Query, "roleId" | "definitionId">>, clear = false) {
    const params = new URLSearchParams({ view: list ? "list" : "week", date, from, until, canceled: filters.showCanceled ? "1" : "0", ...changes });
    if (!clear) {
      filters.definitionIds.forEach(id => params.append("definitionId", id));
      filters.roleIds.forEach(id => params.append("roleId", id));
    }
    return `/admin/scheduling?${params}`;
  }
  const groups = new Map<string, NonNullable<typeof result.data>["shifts"]>();
  result.data?.shifts.forEach(shift => { const day = phoenixDate(shift.startsAt); groups.set(day, [...(groups.get(day) || []), shift]); });
  return <>
    <SchedulingNav /><h1 className="text-3xl font-semibold">Shift schedule</h1>
    <p className="mt-3 text-cream-300">Plan upcoming work in America/Phoenix. These administrative schedules do not describe historical operating hours.</p>
    <div className="mt-5 flex flex-wrap gap-4">
      {result.data?.canWrite && <Link href="/admin/scheduling/new" className="rounded border border-charcoal-500 px-4 py-3">Create one-time shift</Link>}
      <Link href={href({ view: "week", date: from, page: "1" })} aria-current={!list ? "page" : undefined} className="rounded border border-charcoal-500 px-4 py-3">Weekly calendar</Link>
      <Link href={href({ view: "list", page: "1" })} aria-current={list ? "page" : undefined} className="rounded border border-charcoal-500 px-4 py-3">Chronological list</Link>
    </div>
    {catalog.data && <ScheduleFilters key={`${list}:${date}:${from}:${until}:${filters.definitionIds.join(",")}:${filters.roleIds.join(",")}:${filters.showCanceled}`} definitions={catalog.data.definitions} roles={catalog.data.roles} definitionIds={filters.definitionIds} roleIds={filters.roleIds} showCanceled={filters.showCanceled} list={list} date={date} from={from} until={until} clearHref={href({ page: "1" }, true)} />}
    {catalog.error && <Notice>{catalog.error}</Notice>}
    {!result.data ? <Notice>{result.error}</Notice> : result.data.rangeError ? <Notice>{result.data.rangeError}</Notice> : <>
      {!list ? <>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><Link className="text-peach-200 underline" href={href({ date: addDays(from, -7), page: "1" })}>Previous week</Link><h2 className="text-xl font-semibold">{headingDate(from)} – {headingDate(until)}</h2><Link className="text-peach-200 underline" href={href({ date: addDays(from, 7), page: "1" })}>Next week</Link></div>
        {!result.data.shifts.length && <Notice>No shifts are recorded in this range.</Notice>}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">{weekDates(date).map(day => <section key={day} aria-label={`${weekdays[dayNumber(day)]} ${day}`} className="min-w-0 rounded-lg border border-charcoal-700 bg-charcoal-950 p-3"><h3 className="mb-4 border-b border-charcoal-700 pb-3 font-semibold">{weekdays[dayNumber(day)]}<time dateTime={day} className="block text-sm text-cream-300">{headingDate(day)}</time></h3>
          <ul className="space-y-3">{shiftsOnDay(result.data!.shifts, day).map(segment => <li key={segment.shift.id} className="rounded border border-charcoal-600 bg-charcoal-900 p-3"><Link className="block break-words font-semibold text-peach-200 underline" href={`/admin/scheduling/${segment.shift.id}`}>{segment.shift.definition.name}</Link><p className="my-2 text-sm">{clock.format(segment.startsAt)} – {phoenixDate(segment.endsAt) !== day ? "midnight" : clock.format(segment.endsAt)}</p><ShiftState status={segment.shift.status} />{segment.continuesFrom && <p className="mt-2 text-xs">Continues from previous day</p>}{segment.continuesTo && <p className="mt-2 text-xs">Continues next day</p>}{segment.overlapping && <p className="mt-2 text-xs text-cream-300">Overlaps another shift</p>}</li>)}</ul>
          {!shiftsOnDay(result.data!.shifts, day).length && <p className="text-sm text-cream-300">No shifts</p>}
        </section>)}</div>
      </> : <>
        <h2 className="mb-4 text-xl font-semibold">{headingDate(from)} – {headingDate(result.data.windowUntil)}</h2>
        {result.data.windowUntil < until && <p className="mb-4 text-cream-300">Long ranges are shown in windows of up to 366 days. Continue to the next window below.</p>}
        {!groups.size && <Notice>No shifts are recorded in this range.</Notice>}
        {Array.from(groups).map(([day, shifts]) => <section key={day} className="mb-8"><h3 className="mb-3 text-lg font-semibold">{headingDate(day)}</h3><ul className="space-y-3">{shifts.map(shift => <li className="rounded-lg border border-charcoal-700 p-5" key={shift.id}><div className="flex flex-wrap items-center justify-between gap-3"><Link href={`/admin/scheduling/${shift.id}`} className="font-semibold text-peach-200 underline">{shift.definition.name}</Link><ShiftState status={shift.status} /></div><p className="mt-2">{scheduleTime.format(shift.startsAt)} to {scheduleTime.format(shift.endsAt)}</p><p className="mt-2 text-sm text-cream-300">{shift.definition.role.name} · Capacity {shift.capacity} · {shift.patternId ? "Repeating shift" : "One-time shift"}</p></li>)}</ul></section>)}
        {result.data.windowUntil < until && <Link className="text-peach-200 underline" href={href({ from: addDays(result.data.windowUntil, 1), page: "1" })}>Continue viewing through {headingDate(until)}</Link>}
      </>}
      {(page > 1 || result.data.hasMore) && <nav aria-label="Shift result pages" className="mt-6 flex flex-wrap gap-5"><p>Page {page} · Up to 200 shifts per page</p>{page > 1 && <Link className="underline" href={href({ page: String(page - 1) })}>Previous results</Link>}{result.data.hasMore && <Link className="underline" href={href({ page: String(page + 1) })}>More shifts in this window</Link>}</nav>}
    </>}
  </>;
}
