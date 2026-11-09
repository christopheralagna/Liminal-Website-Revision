import Link from "next/link";
import { requirePermission } from "@/server/auth/permissions";
import { getVolunteers } from "@/server/admin/queries";
import { readAdminPage } from "@/server/admin/page-access";
import { Notice } from "@/components/admin/Notice";

export default async function VolunteersPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const status = (await searchParams)?.status;
  const result = await readAdminPage(async () => ({ volunteers: await getVolunteers(), user: await requirePermission("volunteers:read") }));
  const volunteers = result.data?.volunteers.filter(volunteer => status === "ACTIVE" || status === "INACTIVE" ? volunteer.status === status : true);
  return <>
    <h1 className="text-3xl font-semibold">Volunteers</h1>
    <p className="mt-3 text-cream-300">Recorded profiles and operational role memberships. These roles do not grant application permissions. Volunteer records are separate from administrative login accounts.</p>
    {result.data && <div className="mt-5 flex flex-wrap items-center gap-5">
      {(result.data.user.role === "ADMIN" || result.data.user.role === "COORDINATOR") && <Link href="/admin/volunteers/new" className="rounded border border-charcoal-500 px-4 py-2">Create volunteer</Link>}
      <nav aria-label="Filter volunteers" className="flex flex-wrap gap-4">{[["", "All"], ["ACTIVE", "Active"], ["INACTIVE", "Inactive"]].map(([value, label]) => <Link key={value} className="underline" aria-current={(status || "") === value ? "page" : undefined} href={value ? `/admin/volunteers?status=${value}` : "/admin/volunteers"}>{label}</Link>)}</nav>
    </div>}
    <div className="mt-8">
      {!result.data ? <Notice>{result.error}</Notice> : !volunteers?.length ? <Notice>{status ? "No volunteers match this status." : "No volunteers are recorded."}</Notice> : <div className="overflow-x-auto rounded-lg border border-charcoal-700"><table className="w-full text-left">
        <caption className="sr-only">Recorded volunteers</caption>
        <thead className="bg-charcoal-900"><tr>{["Name", "Status", "Operational roles"].map(label => <th scope="col" key={label} className="p-4">{label}</th>)}</tr></thead>
        <tbody>{volunteers.map(volunteer => <tr key={volunteer.id} className="border-t border-charcoal-700"><th scope="row" className="p-4 font-normal"><Link className="underline" href={`/admin/volunteers/${volunteer.id}`}>{volunteer.displayName}</Link></th><td className="p-4">{volunteer.status === "ACTIVE" ? "Active" : "Inactive"}</td><td className="p-4">{volunteer.roles.map(({ role }) => `${role.name}${role.isActive ? "" : " (inactive role)"}`).join(", ") || "None recorded"}</td></tr>)}</tbody>
      </table></div>}
    </div>
  </>;
}
