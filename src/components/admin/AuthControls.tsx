"use client";

import { useState, type FormEvent } from "react";

const button = "min-h-11 rounded-md bg-terracotta-600 px-5 py-3 font-semibold text-cream-50 hover:bg-terracotta-500 disabled:opacity-60";

export function LoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    setError(""); setPending(true);
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(values.get("email")).trim(), password: values.get("password") }),
      });
      if (!response.ok) {
        setError(response.status === 429 ? "Too many sign-in attempts. Please wait a minute and try again." : response.status >= 500 ? "Sign-in is temporarily unavailable. Please try again later." : "Unable to sign in. Check your email and password.");
        setPending(false); return;
      }
      // A full navigation discards previously rendered authenticated content.
      window.location.replace("/admin");
    } catch { setError("Unable to connect. Please try again."); setPending(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5" aria-busy={pending}>
    <div><label htmlFor="email" className="mb-2 block">Email</label><input id="email" name="email" type="email" autoComplete="username" required maxLength={254} disabled={pending} className="min-h-11 w-full rounded-md border border-charcoal-600 bg-charcoal-950 p-3" /></div>
    <div><label htmlFor="password" className="mb-2 block">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required minLength={12} maxLength={128} disabled={pending} className="min-h-11 w-full rounded-md border border-charcoal-600 bg-charcoal-950 p-3" /></div>
    {error && <p role="alert" className="text-peach-100">{error}</p>}
    <button disabled={pending} className={`${button} w-full`}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error();
      window.location.replace("/admin/login");
    } catch { setError("Unable to sign out. Please try again."); setPending(false); }
  }
  return <div><button onClick={logout} disabled={pending} className={button}>{pending ? "Signing out…" : "Sign out"}</button>{error && <p role="alert" className="mt-2 text-peach-100">{error}</p>}</div>;
}
