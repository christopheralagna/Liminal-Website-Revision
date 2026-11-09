import { getVolunteers } from "@/server/admin/queries";
import { readAdminPage } from "@/server/admin/page-access";
import { Notice } from "@/components/admin/Notice";

export default async function VolunteersPage() {
  const result = await readAdminPage(getVolunteers);
  return <>
    <h1 className="text-3xl font-semibold">Volunteers</h1>
    <p className="mt-3 text-cream-300">Recorded profiles and operational role memberships. These roles do not grant application permissions. Read-only.</p>
    <div className="mt-8">
      {!result.data ? <Notice>{result.error}</Notice> : !result.data.length ? <Notice>No volunteers are recorded.</Notice> : <div className="overflow-x-auto rounded-lg border border-charcoal-700"><table className="w-full text-left">
        <caption className="sr-only">Recorded volunteers</caption>
        <thead className="bg-charcoal-900"><tr>{["Name", "Status", "Operational roles"].map(label => <th scope="col" key={label} className="p-4">{label}</th>)}</tr></thead>
        <tbody>{result.data.map(volunteer => <tr key={volunteer.id} className="border-t border-charcoal-700"><th scope="row" className="p-4 font-normal">{volunteer.displayName}</th><td className="p-4">{volunteer.status === "ACTIVE" ? "Active" : "Inactive"}</td><td className="p-4">{volunteer.roles.map(({ role }) => `${role.name}${role.isActive ? "" : " (inactive role)"}`).join(", ") || "None recorded"}</td></tr>)}</tbody>
      </table></div>}
    </div>
  </>;
}
