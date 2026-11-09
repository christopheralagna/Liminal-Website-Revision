import Link from "next/link";
import { getDashboard } from "@/server/admin/queries";
import { readAdminPage } from "@/server/admin/page-access";
import { Notice } from "@/components/admin/Notice";

export default async function DashboardPage() {
  const result = await readAdminPage(getDashboard);
  return <>
    <h1 className="text-3xl font-semibold">Dashboard</h1>
    <p className="mt-3 text-cream-300">Read-only demonstration using recorded administrative data. Seed records are synthetic, not historical operations.</p>
    {result.data ? <>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Active volunteers", result.data.activeVolunteers], ["Active operational roles", result.data.activeRoles], ["Scheduled shifts", result.data.scheduledShifts], ["Assignments on scheduled shifts", result.data.assignedVolunteers]].map(([label, value]) => <div key={label} className="rounded-lg border border-charcoal-700 bg-charcoal-900 p-5"><dt className="text-sm text-cream-300">{label}</dt><dd className="mt-3 text-3xl font-semibold">{value}</dd></div>)}
      </dl>
      <p className="mt-5 text-sm text-cream-300">Calculated counts of current database records. Scheduled means status SCHEDULED, regardless of date. Assignments count ASSIGNED records, not unique people.</p>
      {Object.values(result.data).every(value => value === 0) && <div className="mt-6"><Notice>No active volunteers, active roles, scheduled shifts, or current assignments are recorded.</Notice></div>}
      <div className="mt-8 flex flex-wrap gap-6"><Link className="py-2 text-peach-200 underline" href="/admin/volunteers">View volunteers</Link><Link className="py-2 text-peach-200 underline" href="/admin/scheduling">View recorded shifts</Link></div>
    </> : <div className="mt-8"><Notice>{result.error}</Notice></div>}
  </>;
}
