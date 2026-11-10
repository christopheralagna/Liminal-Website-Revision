"use client";
import Link from "next/link";
import { useState } from "react";
const control = "mt-1 block min-h-11 w-full rounded border border-charcoal-600 bg-charcoal-900 p-3";
type TypeOption = { id: string; name: string; roleId: string; isActive: boolean };
export function ScheduleFilters({ roles, definitions, roleIds, definitionIds, showCanceled, list, date, from, until, clearHref }: {
  roles: { id: string; name: string }[]; definitions: TypeOption[]; roleIds: string[]; definitionIds: string[]; showCanceled: boolean;
  list: boolean; date: string; from: string; until: string; clearHref: string;
}) {
  const [selectedRoles, setRoles] = useState(roleIds);
  const [selectedTypes, setTypes] = useState(definitionIds);
  const [notice, setNotice] = useState("");
  const available = definitions.filter(type => !selectedRoles.length || selectedRoles.includes(type.roleId));
  const outside = definitions.filter(type => selectedTypes.includes(type.id) && !available.some(option => option.id === type.id));
  const missing = selectedTypes.filter(id => !definitions.some(type => type.id === id));
  function changeRole(id: string, checked: boolean) {
    const next = checked ? [...selectedRoles, id] : selectedRoles.filter(value => value !== id);
    const allowed = definitions.filter(type => !next.length || next.includes(type.roleId));
    const removed = selectedTypes.filter(value => !allowed.some(type => type.id === value));
    setRoles(next);
    setTypes(selectedTypes.filter(value => !removed.includes(value)));
    setNotice(removed.length ? `Cleared incompatible shift types: ${removed.map(value => definitions.find(type => type.id === value)?.name || "unavailable type").join(", ")}. Apply filters to update results.` : "Apply filters to update results.");
  }
  function typeCheckbox(type: TypeOption, extra = "") {
    return <label key={type.id} className="flex items-start gap-3 py-2"><input className="mt-1" type="checkbox" name="definitionId" value={type.id} checked={selectedTypes.includes(type.id)} onChange={event => setTypes(current => event.target.checked ? [...current, type.id] : current.filter(id => id !== type.id))} /><span>{type.name}{!type.isActive && " (inactive)"}{extra}</span></label>;
  }
  return <form className="my-6 grid gap-5 rounded-lg border border-charcoal-700 p-5 sm:grid-cols-2 lg:grid-cols-3">
    <input type="hidden" name="view" value={list ? "list" : "week"} />
    <div className="space-y-4">{list ? <><label className="block">From<input type="date" name="from" required defaultValue={from} min="2000-01-01" max="2099-12-31" className={control} /></label><label className="block">Through<input type="date" name="until" required defaultValue={until} min="2000-01-01" max="2099-12-31" className={control} /></label></> : <label className="block">Jump to date<input type="date" name="date" required defaultValue={date} min="2000-01-01" max="2099-12-31" className={control} /></label>}
      <label className="flex items-center gap-3"><input type="checkbox" name="canceled" value="1" defaultChecked={showCanceled} />Show canceled shifts</label>
      <p className="text-sm text-cream-300">Select any roles and types. Within each group, any selected item matches. Between groups, both must match. An empty group includes all.</p>
    </div>
    <fieldset className="min-w-0"><legend className="font-semibold">Operational roles</legend><div className="mt-2 max-h-60 overflow-y-auto">{roles.map(role => <label className="flex items-start gap-3 py-2" key={role.id}><input className="mt-1" type="checkbox" name="roleId" value={role.id} checked={selectedRoles.includes(role.id)} onChange={event => changeRole(role.id, event.target.checked)} />{role.name}</label>)}{selectedRoles.filter(id => !roles.some(role => role.id === id)).map(id => <label className="flex items-center gap-3 py-2" key={id}><input type="checkbox" name="roleId" value={id} checked onChange={() => changeRole(id, false)} />Unavailable role ({id})</label>)}</div></fieldset>
    <fieldset className="min-w-0"><legend className="font-semibold">Shift types</legend><div className="mt-2 max-h-60 overflow-y-auto">{roles.filter(role => available.some(type => type.roleId === role.id)).map(role => <div key={role.id} className="mb-3"><p className="text-sm font-semibold text-cream-300">{role.name}</p>{available.filter(type => type.roleId === role.id).map(type => typeCheckbox(type))}</div>)}{!available.length && <p className="py-2 text-cream-300">No shift types for these roles.</p>}
      {outside.length > 0 && <div className="border-t border-charcoal-600 pt-3"><p className="text-sm text-peach-100">Selected types outside the chosen roles cannot match. Remove them or clear filters.</p>{outside.map(type => typeCheckbox(type, " (outside selected roles)"))}</div>}
      {missing.map(id => <label key={id} className="flex gap-3 py-2"><input type="checkbox" name="definitionId" value={id} checked onChange={() => setTypes(current => current.filter(value => value !== id))} />Unavailable shift type ({id})</label>)}
    </div></fieldset>
    <div className="flex flex-wrap items-center gap-5 sm:col-span-2 lg:col-span-3"><button className="min-h-11 rounded border border-charcoal-500 px-4 py-3">Apply filters</button><Link className="text-peach-200 underline" href={clearHref}>Clear filters</Link>{notice && <p role="status" className="text-sm text-peach-100">{notice}</p>}</div>
  </form>;
}
