"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveVolunteerAction } from "@/app/admin/(protected)/volunteers/actions";
import { DEFAULT_TIME_ZONE, weekdays, type VolunteerInput } from "@/server/volunteers/validation";

const control = "mt-1 block w-full rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-cream-100 disabled:opacity-80";
const button = "rounded border border-charcoal-500 px-4 py-2 disabled:opacity-50 hover:bg-charcoal-800";
type Props = { initial: VolunteerInput; roles: { id: string; name: string; isActive: boolean }[]; canWrite: boolean; mode: "create" | "update"; today: string };

export function VolunteerForm({ initial, roles, canWrite, mode, today }: Props) {
  const [value, setValue] = useState(initial);
  const [feedback, setFeedback] = useState<{ error: string; issues?: string[] } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function field<K extends keyof VolunteerInput>(name: K, next: VolunteerInput[K]) { setValue(current => ({ ...current, [name]: next })); }
  function windowField(index: number, name: string, next: string | number) {
    setValue(current => ({ ...current, availability: current.availability.map((window, i) => i === index ? { ...window, [name]: next } : window) }));
  }
  return <form className="mt-6 space-y-8" onSubmit={event => {
    event.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await saveVolunteerAction(mode, value);
        if (!result.ok) { setFeedback(result); return; }
        router.replace(`/admin/volunteers/${result.id}?saved=1`);
        router.refresh();
      } catch { setFeedback({ error: "Unable to save. Check your connection and try again." }); }
    });
  }}>
    {!canWrite && <p className="text-cream-300">Read-only access. An administrator or coordinator can update this record.</p>}
    {feedback && <div role="alert" className="rounded border border-red-400 p-4"><p>{feedback.error}</p>{feedback.issues && <ul className="mt-2 list-disc pl-5">{feedback.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>}</div>}
    <fieldset disabled={!canWrite || pending} className="space-y-8">
      <legend className="sr-only">Volunteer information</legend>
      <section aria-labelledby="profile-heading" className="rounded-lg border border-charcoal-700 p-5">
        <h2 id="profile-heading" className="text-xl font-semibold">Profile</h2>
        <p className="mt-2 text-sm text-cream-300">A volunteer record does not create an application login account.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label>Name <span aria-hidden="true">*</span><input className={control} required maxLength={120} autoComplete="name" value={value.displayName} onChange={e => field("displayName", e.target.value)} /></label>
          <label>Email (optional)<input className={control} type="email" maxLength={254} autoComplete="email" value={value.email} onChange={e => field("email", e.target.value)} /></label>
          <label>Status<select className={control} value={value.status} onChange={e => field("status", e.target.value as VolunteerInput["status"])}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
        </div>
        <p className="mt-3 text-sm text-cream-300">Inactive volunteers remain in administrative records. Status changes preserve historical assignments.</p>
      </section>
      <section aria-labelledby="roles-heading" className="rounded-lg border border-charcoal-700 p-5">
        <h2 id="roles-heading" className="text-xl font-semibold">Operational roles</h2>
        <p className="mt-2 text-sm text-cream-300">Select all activities this volunteer is authorized to perform. These roles do not grant application access.</p>
        <div className="mt-4 flex flex-wrap gap-5">{roles.map(role => <label key={role.id} className="flex items-center gap-2"><input type="checkbox" checked={value.roleIds.includes(role.id)} onChange={e => field("roleIds", e.target.checked ? [...value.roleIds, role.id] : value.roleIds.filter(id => id !== role.id))} />{role.name}{!role.isActive && " (inactive role)"}</label>)}</div>
        {!roles.length && <p className="mt-3">No operational roles are recorded.</p>}
        {!value.roleIds.length && <p className="mt-3 text-sm text-cream-300">No roles assigned.</p>}
      </section>
      <section aria-labelledby="availability-heading" className="rounded-lg border border-charcoal-700 p-5">
        <h2 id="availability-heading" className="text-xl font-semibold">Weekly availability</h2>
        <p className="mt-2 text-sm text-cream-300">Local times in America/Phoenix for new windows. Effective dates include both start and end dates; a blank end date continues indefinitely. Windows cannot overlap in time and effective dates. Split overnight availability across two days. This information does not enforce scheduling eligibility.</p>
        {!value.availability.length && <p className="mt-4">No availability recorded; availability is unknown.</p>}
        {weekdays.map((day, weekday) => {
          const windows = value.availability.map((window, index) => ({ window, index })).filter(({ window }) => window.dayOfWeek === weekday);
          return <div key={day} className="mt-6 border-t border-charcoal-700 pt-4">
            <h3 className="font-semibold">{day}</h3>
            {!windows.length && <p className="mt-2 text-sm text-cream-300">No windows recorded.</p>}
            {windows.map(({ window, index }, dayIndex) => <fieldset key={window.id} className="mt-3 rounded border border-charcoal-700 p-4">
              <legend className="px-1 text-sm">{day} window {dayIndex + 1} · {window.timeZone}</legend>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label>Start time<input className={control} required type="time" value={window.start} onChange={e => windowField(index, "start", e.target.value)} /></label>
                <label>End time{window.end === "24:00" ? <input className={control} disabled value="Midnight (end of day)" /> : <input className={control} required type="time" value={window.end} onChange={e => windowField(index, "end", e.target.value)} />}</label>
                <label>Effective from<input className={control} required type="date" value={window.validFrom} onChange={e => windowField(index, "validFrom", e.target.value)} /></label>
                <label>Effective until (optional)<input className={control} type="date" min={window.validFrom} value={window.validUntil} onChange={e => windowField(index, "validUntil", e.target.value)} /></label>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={window.end === "24:00"} onChange={e => windowField(index, "end", e.target.checked ? "24:00" : "17:00")} />Ends at midnight (24:00)</label>
              {canWrite && <button className={`${button} mt-3`} type="button" onClick={() => field("availability", value.availability.filter(item => item.id !== window.id))}>Remove {day} window {dayIndex + 1}</button>}
            </fieldset>)}
            {canWrite && <button type="button" className={`${button} mt-3`} onClick={() => field("availability", [...value.availability, { id: crypto.randomUUID(), dayOfWeek: weekday, start: "09:00", end: "12:00", timeZone: DEFAULT_TIME_ZONE, validFrom: today, validUntil: "" }])}>Add {day} window</button>}
          </div>;
        })}
      </section>
      <section aria-labelledby="certificate-heading" className="rounded-lg border border-charcoal-700 p-5">
        <h2 id="certificate-heading" className="text-xl font-semibold">Food-handler certificate</h2>
        <p className="mt-2 text-sm text-cream-300">Optional and informational. Missing dates mean unknown; these dates do not grant operational roles or establish a certification requirement.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label>Issued on (optional)<input className={control} type="date" value={value.foodHandlerIssuedOn} onChange={e => field("foodHandlerIssuedOn", e.target.value)} /></label>
          <label>Expires on (optional)<input className={control} type="date" min={value.foodHandlerIssuedOn || undefined} value={value.foodHandlerExpiresOn} onChange={e => field("foodHandlerExpiresOn", e.target.value)} /></label>
        </div>
        {(!value.foodHandlerIssuedOn || !value.foodHandlerExpiresOn) && <p className="mt-3 text-sm text-cream-300">{!value.foodHandlerIssuedOn && "Issuance date unknown. "}{!value.foodHandlerExpiresOn && "Expiration date unknown."}</p>}
      </section>
      {canWrite && <button className="rounded bg-cream-100 px-5 py-3 font-semibold text-charcoal-900 disabled:opacity-50" type="submit">{pending ? "Saving…" : mode === "create" ? "Create volunteer" : "Save changes"}</button>}
    </fieldset>
    <p role="status" aria-live="polite">{pending ? "Saving volunteer information…" : ""}</p>
  </form>;
}
