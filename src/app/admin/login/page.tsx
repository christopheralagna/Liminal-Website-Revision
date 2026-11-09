import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/permissions";
import { AuthorizationError } from "@/server/auth/authorization";
import { LoginForm } from "@/components/admin/AuthControls";
import { Notice } from "@/components/admin/Notice";

export default async function LoginPage() {
  let signedIn = false;
  let unavailable = false;
  try { await requireUser(); signedIn = true; }
  catch (error) { unavailable = !(error instanceof AuthorizationError); }
  if (signedIn) redirect("/admin");
  return <main id="admin-content" tabIndex={-1} className="mx-auto max-w-md px-6 py-16 sm:py-24">
    <p className="text-sm uppercase tracking-widest text-peach-200">Liminal · Administration</p>
    <h1 className="mt-4 text-3xl font-semibold">Sign in</h1>
    <p className="mt-3 text-cream-300">Use your provisioned administrative account.</p>
    {unavailable ? <div className="mt-8"><Notice>Sign-in is temporarily unavailable. Please try again later.</Notice></div> : <LoginForm />}
    <Link href="/" className="mt-8 inline-block py-2 text-peach-200 underline">Visit the historical archive</Link>
  </main>;
}
