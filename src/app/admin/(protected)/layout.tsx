import Link from "next/link";
import { requireUser } from "@/server/auth/permissions";
import { readAdminPage } from "@/server/admin/page-access";
import { LogoutButton } from "@/components/admin/AuthControls";
import { Notice } from "@/components/admin/Notice";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const result = await readAdminPage(requireUser);
  if (result.error || !result.data) return <main id="admin-content" className="mx-auto max-w-3xl p-6"><Notice>{result.error}</Notice><Link href="/admin/login" className="mt-6 inline-block underline">Return to sign in</Link></main>;
  const user = result.data;
  return <>
    <header className="border-b border-charcoal-700 bg-charcoal-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div><Link href="/admin" className="text-xl font-semibold">Liminal Administration</Link><p className="mt-1 text-sm text-cream-300">{user.name} · {user.role}</p><p className="mt-1 break-all text-sm text-cream-300">{user.email}</p></div>
        <LogoutButton />
      </div>
      <nav aria-label="Administration" className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-2 px-6 pb-4">
        <Link href="/admin" className="py-2 underline underline-offset-4">Dashboard</Link>
        <Link href="/admin/volunteers" className="py-2 underline underline-offset-4">Volunteers</Link>
        <Link href="/admin/scheduling" className="py-2 underline underline-offset-4">Scheduling</Link>
      </nav>
    </header>
    <main id="admin-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
  </>;
}
