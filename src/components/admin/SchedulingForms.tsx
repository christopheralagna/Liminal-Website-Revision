"use client";
import { useState, useTransition, useRef, useEffect, useId, createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { schedulingAction } from "@/app/admin/(protected)/scheduling/actions";
import type { SchedulingCommand } from "@/server/scheduling/service";
import { schedulingSchemas, validationFields } from "@/server/scheduling/validation";
import { addDays } from "@/server/scheduling/dates";

const control = "mt-1 block min-h-11 w-full rounded border border-charcoal-600 bg-charcoal-900 p-3 text-cream-100";
const button = "min-h-11 rounded bg-cream-100 px-5 py-3 font-semibold text-charcoal-900 disabled:opacity-50";
const panel = "mt-6 space-y-5 rounded-lg border border-charcoal-700 p-5";
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const text = (data: FormData, key: string) => String(data.get(key) || "");
const number = (data: FormData, key: string) => Number(data.get(key));
type Definition = { id: string; name: string; role: { id: string; name: string } };
const noErrors: Record<string, string> = {};
const Errors = createContext<{ fields: Record<string, string>; prefix: string }>({ fields: {}, prefix: "" });
function FieldError({ name }: { name: string }) {
  const { fields, prefix } = useContext(Errors);
  return fields[name] ? <span className="mt-2 block text-sm text-peach-100" id={`${prefix}-${name}-error`}>{fields[name]}</span> : null;
}
const fieldLabels: Record<string, string> = { date: "Start date", endDate: "End date", start: "Start time", end: "End time", definitionId: "Shift type", validFrom: "Repeats from", validUntil: "Repeats until", from: "Add shifts from", until: "Add shifts through", capacity: "Capacity", durationMinutes: "Duration", name: "Shift type name", roleId: "Operational role", confirm: "Confirmation" };
function MutationForm({ command, build, destination, children, label }: {
  command: SchedulingCommand; build: (data: FormData) => unknown; destination?: "shift" | "pattern" | "type"; children: ReactNode; label: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const prefix = useId().replaceAll(":", "");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ error?: string; message?: string; fieldErrors?: Record<string, string>; blockedShifts?: { id: string; startsAt: string }[] } | null>(null);
  const fields = feedback?.fieldErrors || noErrors;
  useEffect(() => {
    for (const element of Array.from(formRef.current?.elements || [])) {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) continue;
      if (!element.id) element.id = `${prefix}-${element.name}`;
      if (fields[element.name]) { element.setAttribute("aria-invalid", "true"); element.setAttribute("aria-describedby", `${prefix}-errors`); }
      else { element.removeAttribute("aria-invalid"); element.removeAttribute("aria-describedby"); }
    }
    if (feedback?.error) alertRef.current?.focus();
  }, [feedback, fields, prefix]);
  return <Errors.Provider value={{ fields, prefix }}><form ref={formRef} noValidate className={panel} aria-busy={pending} onSubmit={event => {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const nativeErrors: Record<string, string> = {};
    for (const element of Array.from(form.elements)) {
      if ((element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) && !element.validity.valid) nativeErrors[element.name || "form"] = element.validationMessage;
    }
    const input = build(new FormData(form));
    const validated = schedulingSchemas[command].safeParse(input);
    const fieldErrors = { ...nativeErrors, ...(!validated.success ? validationFields(validated.error) : {}) };
    if (Object.keys(fieldErrors).length) { setFeedback({ error: "Please correct the highlighted fields.", fieldErrors }); return; }
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await schedulingAction(command, input, Boolean(destination));
        if (!result.ok) { setFeedback(result); return; }
        setFeedback({ message: result.message || "Changes saved." });
        // Revalidation updates in-place forms; successful creations navigate in
        // the Server Action, as part of its response, without a second RSC request.
      } catch (error) {
        unstable_rethrow(error);
        setFeedback({ error: "The response could not be received. Your changes may have saved. Check the schedule before trying again; retrying this form keeps the same record ID." });
      }
    });
  }}>
    {feedback?.error && <div ref={alertRef} tabIndex={-1} role="alert" id={`${prefix}-errors`} className="rounded border border-peach-200 p-4 text-peach-100"><p>{feedback.error}</p>
      {!!Object.keys(fields).length && <ul className="mt-2 list-disc pl-5">{Object.entries(fields).map(([name, error]) => <li key={name}><button className="text-left underline" type="button" onClick={() => { const field = formRef.current?.elements.namedItem(name); if (field instanceof HTMLElement) field.focus(); }}>{fieldLabels[name] || name}: {error}</button></li>)}</ul>}
      {feedback.blockedShifts && <ul className="mt-3 space-y-2">{feedback.blockedShifts.map(shift => <li key={shift.id}><a className="underline" href={`/admin/scheduling/${shift.id}`}>Review shift · {new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", dateStyle: "medium", timeStyle: "short" }).format(new Date(shift.startsAt))}</a></li>)}</ul>}
    </div>}
    {feedback?.message && <p role="status">{feedback.message}</p>}
    <fieldset disabled={pending} className="space-y-5">{children}<button className={button}>{pending ? "Saving…" : label}</button></fieldset>
  </form></Errors.Provider>;
}
function DateField({ label, name, value, min }: { label: string; name: string; value: string; min?: string }) {
  return <label className="block">{label}<input className={control} name={name} type="date" required defaultValue={value} min={min || "2000-01-01"} max="2099-12-31" /><FieldError name={name} /></label>;
}
function TimeField({ label, name, value }: { label: string; name: string; value: string }) {
  return <label className="block">{label}<input className={control} name={name} type="time" required defaultValue={value} /><FieldError name={name} /></label>;
}
function Capacity({ value }: { value: number }) {
  return <label className="block">Capacity<input className={control} name="capacity" type="number" required min={1} max={1000} defaultValue={value} /><FieldError name="capacity" /></label>;
}
function DefinitionSelect({ definitions, roles }: { definitions: Definition[]; roles: { id: string; name: string }[] }) {
  const [roleId, setRoleId] = useState("");
  const [definitionId, setDefinitionId] = useState("");
  const available = definitions.filter(definition => definition.role.id === roleId);
  return <div className="space-y-5">
    <label className="block">Operational role<select name="roleId" className={control} required value={roleId} onChange={event => { setRoleId(event.target.value); setDefinitionId(""); }}><option value="" disabled>Select an operational role</option>{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select><FieldError name="roleId" /></label>
    <label className="block">Shift type<select className={control} name="definitionId" required value={definitionId} disabled={!roleId} onChange={event => setDefinitionId(event.target.value)}><option value="" disabled>{roleId ? "Select a shift type" : "Choose an operational role first"}</option>{available.map(definition => <option key={definition.id} value={definition.id}>{definition.name}</option>)}</select><FieldError name="definitionId" /></label>
    {roleId && !available.length && <p className="text-cream-300">No active shift types for this role. Create one in the catalog first.</p>}
    <Link href="/admin/scheduling/types" className="inline-block text-peach-200 underline">Manage shift types</Link>
  </div>;
}
export function DefinitionCreator({ id, roles, initialRole = "" }: { id: string; roles: { id: string; name: string }[]; initialRole?: string }) {
  const [recordId] = useState(id);
  return <MutationForm command="definition" destination="type" build={data => ({ id: recordId, name: text(data, "name"), roleId: text(data, "roleId") })} label="Create shift type">
    <label className="block">Operational role<select name="roleId" className={control} required defaultValue={initialRole}><option value="" disabled>Select an operational role</option>{roles.map(role => <option value={role.id} key={role.id}>{role.name}</option>)}</select><FieldError name="roleId" /></label>
    <label className="block">Shift type name<input name="name" className={control} required maxLength={120} /><FieldError name="name" /></label>
    <p className="text-sm text-cream-300">Shift types belong to one operational role. This does not grant administrative permissions.</p>
  </MutationForm>;
}
export function DefinitionEditor({ definition, canWrite }: { definition: { id: string; name: string; isActive: boolean; updatedAt: string; role: { name: string; isActive: boolean }; shiftCount: number; patternCount: number }; canWrite: boolean }) {
  if (!canWrite) return <p className="mt-6">Read-only access. An administrator or coordinator can manage shift types.</p>;
  const references = definition.shiftCount + definition.patternCount;
  return <>
    <MutationForm command="updateDefinition" destination="type" label="Save shift type" build={data => ({ id: definition.id, updatedAt: definition.updatedAt, name: text(data, "name"), isActive: text(data, "isActive") === "true" })}>
      <label className="block">Shift type name<input name="name" className={control} required maxLength={120} defaultValue={definition.name} /><FieldError name="name" /></label>
      <p>Renaming also changes the name displayed on existing and historical shifts. To preserve the old label’s meaning, create a new type and deactivate this one.</p>
      <label className="block">Status<select className={control} name="isActive" defaultValue={String(definition.isActive)}><option value="true" disabled={!definition.role.isActive && !definition.isActive}>Active</option><option value="false">Inactive</option></select><FieldError name="isActive" /></label>
      {!definition.role.isActive && <p>The operational role is inactive. Its types cannot be selected for new shifts, and inactive types cannot be reactivated until the role is active.</p>}
      <p className="text-sm text-cream-300">The operational role is fixed. Create a new shift type under another role instead of reclassifying existing schedules.</p>
    </MutationForm>
    {references ? <p className="mt-6 rounded border border-charcoal-700 p-5">Cannot permanently delete: {definition.shiftCount} shift(s) and {definition.patternCount} repeating schedule(s) reference this type, including historical and canceled records. Deactivate it above instead.</p> : <MutationForm command="deleteDefinition" destination="type" label="Permanently delete unused shift type" build={() => ({ id: definition.id, updatedAt: definition.updatedAt })}>
      <p>This type has no shifts or repeating schedules. Permanent deletion cannot be undone. The server checks references again before deleting.</p>
      <label className="flex gap-3"><input type="checkbox" name="confirm" required />Permanently delete this unused shift type</label>
    </MutationForm>}
  </>;
}
export type ShiftFields = { date: string; start: string; endDate: string; end: string; capacity: number };
export function ShiftForm({ id, updatedAt, definitions = [], roles = [], initial }: { id: string; updatedAt?: string; definitions?: Definition[]; roles?: { id: string; name: string }[]; initial: ShiftFields }) {
  const [recordId] = useState(id);
  return <MutationForm command={updatedAt ? "editShift" : "createShift"} destination="shift" label={updatedAt ? "Save shift changes" : "Create shift"} build={data => ({
    id: recordId, ...(updatedAt ? { updatedAt } : { definitionId: text(data, "definitionId"), roleId: text(data, "roleId") }), date: text(data, "date"), start: text(data, "start"), endDate: text(data, "endDate"), end: text(data, "end"), capacity: number(data, "capacity"),
  })}>
    {!updatedAt && <DefinitionSelect definitions={definitions} roles={roles} />}
    <p className="text-cream-300">Times are local to America/Phoenix. For an overnight shift, explicitly choose the next end date. Maximum duration: 24 hours.</p>
    <div className="grid gap-5 sm:grid-cols-2"><DateField label="Start date" name="date" value={initial.date} /><TimeField label="Start time" name="start" value={initial.start} /><DateField label="End date" name="endDate" value={initial.endDate} /><TimeField label="End time" name="end" value={initial.end} /></div>
    <Capacity value={initial.capacity} />
    {updatedAt && <p className="text-sm text-cream-300">Only this shift changes. Its shift type, repeating schedule, and other shifts remain unchanged.</p>}
  </MutationForm>;
}
export function CancelShift({ id, updatedAt }: { id: string; updatedAt: string }) {
  return <MutationForm command="cancelShift" build={() => ({ id, updatedAt })} label="Cancel this shift"><p>Only this shift is canceled. It stays on record and will not be added again when the schedule is extended. Cancellation cannot be undone here.</p><label className="flex gap-3"><input type="checkbox" name="confirm" required />Cancel this shift</label></MutationForm>;
}
export type PatternFields = { definitionId: string; dayOfWeek: number; start: string; durationMinutes: number; capacity: number; validFrom: string; validUntil: string };
export function PatternForm({ id, definitions = [], roles = [], initial }: { id: string; definitions?: Definition[]; roles?: { id: string; name: string }[]; initial: PatternFields }) {
  const [recordId] = useState(id);
  const [from, setFrom] = useState(initial.validFrom);
  return <MutationForm command="createPattern" destination="pattern" label="Create repeating schedule" build={data => {
    const value = { id: recordId, roleId: text(data, "roleId"), definitionId: text(data, "definitionId"), dayOfWeek: number(data, "dayOfWeek"), start: text(data, "start"), durationMinutes: number(data, "durationMinutes"), capacity: number(data, "capacity"), validFrom: text(data, "validFrom"), validUntil: text(data, "validUntil") };
    return value;
  }}>
    <DefinitionSelect definitions={definitions} roles={roles} />
    <p className="text-cream-300">Repeats weekly in America/Phoenix. This adds up to eight weeks of shifts to the calendar, stopping earlier at the selected end date. You can extend the schedule later.</p>
    <label className="block">Weekday<select className={control} name="dayOfWeek" defaultValue={initial.dayOfWeek}>{weekdays.map((day, i) => <option key={day} value={i}>{day}</option>)}</select></label>
    <TimeField label="Local start time" name="start" value={initial.start} />
    <label className="block">Duration (minutes)<input className={control} name="durationMinutes" type="number" required min={1} max={1440} defaultValue={initial.durationMinutes} /><FieldError name="durationMinutes" /></label>
    <Capacity value={initial.capacity} />
    <label className="block">Repeats from<input className={control} name="validFrom" type="date" required value={from} min="2000-01-01" max="2099-12-31" onChange={event => setFrom(event.target.value)} /><FieldError name="validFrom" /></label>
    <label className="block">Repeats until (optional)<input className={control} name="validUntil" type="date" min={from} max="2099-12-31" defaultValue={initial.validUntil} /><FieldError name="validUntil" /></label>
  </MutationForm>;
}
export function PatternOperations({ id, updatedAt, validFrom, validUntil, latest, allowGeneration = true, active = true }: { id: string; updatedAt: string; validFrom: string; validUntil: string; latest: string; allowGeneration?: boolean; active?: boolean }) {
  const next = latest ? addDays(latest, 1) : validFrom;
  return <>
    {allowGeneration && <section><h2 className="mt-8 text-xl font-semibold">Extend repeating schedule</h2>
      <p className="mt-2 text-cream-300">Add more shifts using the same weekday, time, and capacity. Up to eight weeks per request. Existing and canceled shifts will not be duplicated. If needed, Repeats until will move to the requested date.</p>
      <MutationForm command="extendPattern" label="Add shifts to calendar" build={data => ({ id, updatedAt, from: text(data, "from"), until: text(data, "until") })}>
        <DateField label="Add shifts from" name="from" value={next} /><DateField label="Add shifts through" name="until" value={[addDays(next, 55), ...(validUntil && validUntil >= next ? [validUntil] : []), "2099-12-31"].sort()[0]} />
      </MutationForm>
    </section>}
    {active && <section><h2 className="mt-8 text-xl font-semibold">Shorten repeating schedule</h2>
      <MutationForm command="shortenPattern" label="Shorten schedule" build={data => ({ id, updatedAt, validUntil: text(data, "validUntil") })}>
        <DateField label="Repeats until" name="validUntil" value={validUntil || latest || validFrom} min={validFrom} />
        <p>Future scheduled shifts starting after this date will be canceled. Past and completed shifts stay unchanged. If any affected shift has assignment history, nothing will change and those shifts will be listed for review.</p>
      </MutationForm>
    </section>}
    <section><h2 className="mt-8 text-xl font-semibold">Cancel repeating schedule</h2>
      <MutationForm command="cancelPattern" label="Cancel repeating schedule" build={() => ({ id, updatedAt })}>
        <p>Stop repeating and cancel all remaining future scheduled shifts. Past shifts stay on record. Assignment history blocks the entire operation. Canceled shifts cannot be restored here.</p>
        <label className="flex gap-3"><input type="checkbox" name="confirm" required />Cancel this repeating schedule and its remaining future shifts</label>
      </MutationForm>
    </section>
  </>;
}
