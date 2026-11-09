import { getShifts } from "@/server/admin/queries";
import { readAdminPage } from "@/server/admin/page-access";
import { Notice } from "@/components/admin/Notice";

const dateTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", dateStyle: "medium", timeStyle: "short" });
export default async function SchedulingPage() {
  const result = await readAdminPage(getShifts);
  return <>
    <h1 className="text-3xl font-semibold">Recorded shifts</h1>
    <p className="mt-3 text-cream-300">All recorded occurrences, shown in America/Phoenix time. Cancelled assignments are omitted. Scheduling and assignment changes are not available.</p>
    <div className="mt-8">
      {!result.data ? <Notice>{result.error}</Notice> : !result.data.length ? <Notice>No shifts are recorded.</Notice> : <div className="overflow-x-auto rounded-lg border border-charcoal-700"><table className="w-full min-w-[760px] text-left">
        <caption className="sr-only">Recorded shifts and assignments, America/Phoenix</caption>
        <thead className="bg-charcoal-900"><tr>{["Shift / required role", "Date and time", "Status", "Capacity", "Volunteers"].map(label => <th scope="col" className="p-4" key={label}>{label}</th>)}</tr></thead>
        <tbody>{result.data.map(shift => <tr key={shift.id} className="border-t border-charcoal-700"><th scope="row" className="p-4 font-normal">{shift.definition.name}<span className="mt-1 block text-sm text-cream-300">{shift.definition.role.name}</span></th><td className="p-4"><time dateTime={shift.startsAt.toISOString()}>{dateTime.format(shift.startsAt)}</time><span className="block">to <time dateTime={shift.endsAt.toISOString()}>{dateTime.format(shift.endsAt)}</time></span></td><td className="p-4">{shift.status.toLowerCase()}</td><td className="p-4">{shift.capacity}</td><td className="p-4">{shift.assignments.length ? <ul className="space-y-2">{shift.assignments.map(assignment => <li key={assignment.id}>{assignment.volunteer.displayName} <span className="text-sm text-cream-300">({assignment.status.toLowerCase()})</span></li>)}</ul> : "None assigned"}</td></tr>)}</tbody>
      </table></div>}
    </div>
  </>;
}
