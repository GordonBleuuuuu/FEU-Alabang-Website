"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Banknote, CalendarDays, FileText, Plus, Receipt, TrendingUp, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AppRole, ManagedEvent } from "./AdminWorkspace";
import type { TeamMember } from "./TaskDrawer";
import FinanceRoomManager from "./FinanceRoomManager";

type FinanceEvent = { id: string; portal_event_id: string | null; event_code: string; event_name: string; event_date: string; person_in_charge: string; approved_budget: number; status: "Upcoming" | "Ongoing" | "Completed"; created_at: string };
type Expense = { id: string; finance_event_id: string; expense_date: string; item_code: string | null; item_name: string; category: string; description: string; quantity: number; unit_price: number; total_amount: number; supplier: string | null; requested_by: string; payment_method: string | null; proof_path: string | null; status: "Requested" | "Approved" | "Purchased" | "Reimbursed"; created_at: string };
type Revenue = { id: string; finance_event_id: string; received_date: string; source: string; description: string; quantity: number; amount_per_unit: number; total_amount: number; collected_by: string; payment_method: "Cash" | "GCash" | "Bank Transfer" | "Other"; proof_path: string | null; status: "Pending" | "Collected" | "Deposited"; created_at: string };
type Section = "dashboard" | "events" | "expenses" | "revenue" | "room";
type Dialog = "event" | "expense" | "revenue" | null;

const eventFields = "id,portal_event_id,event_code,event_name,event_date,person_in_charge,approved_budget,status,created_at";
const expenseFields = "id,finance_event_id,expense_date,item_code,item_name,category,description,quantity,unit_price,total_amount,supplier,requested_by,payment_method,proof_path,status,created_at";
const revenueFields = "id,finance_event_id,received_date,source,description,quantity,amount_per_unit,total_amount,collected_by,payment_method,proof_path,status,created_at";
const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-feu-green focus:ring-2 focus:ring-feu-green/15";
const money = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
const today = () => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (name: string) => parts.find((item) => item.type === name)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const errorText = (error: unknown) => error instanceof Error ? error.message : "The record could not be saved.";

export default function FinanceManager({ portalEvents, teamMembers, currentRole }: { portalEvents: ManagedEvent[]; teamMembers: TeamMember[]; currentRole: AppRole }) {
  const [section, setSection] = useState<Section>("dashboard");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [editingEvent, setEditingEvent] = useState<FinanceEvent | null>(null);
  const [events, setEvents] = useState<FinanceEvent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const [eventResult, expenseResult, revenueResult] = await Promise.all([
        supabase.from("finance_events").select(eventFields).order("event_date", { ascending: false }),
        supabase.from("finance_expenses").select(expenseFields).order("expense_date", { ascending: false }),
        supabase.from("finance_revenue").select(revenueFields).order("received_date", { ascending: false }),
      ]);
      if (!active) return;
      const issue = eventResult.error ?? expenseResult.error ?? revenueResult.error;
      if (issue) setLoadError(issue.code === "42P01" || issue.code === "PGRST205" ? "Financial database setup is pending. Apply the financial management migrations before using this section." : issue.message);
      else {
        setEvents((eventResult.data ?? []) as FinanceEvent[]);
        setExpenses((expenseResult.data ?? []) as Expense[]);
        setRevenues((revenueResult.data ?? []) as Revenue[]);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const eventById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);
  const shownEvents = selectedEvent ? events.filter((event) => event.id === selectedEvent) : events;
  const shownExpenses = selectedEvent ? expenses.filter((expense) => expense.finance_event_id === selectedEvent) : expenses;
  const shownRevenues = selectedEvent ? revenues.filter((revenue) => revenue.finance_event_id === selectedEvent) : revenues;
  const spent = (items: Expense[]) => items.filter((item) => item.status === "Purchased" || item.status === "Reimbursed").reduce((sum, item) => sum + Number(item.total_amount), 0);
  const collected = (items: Revenue[]) => items.filter((item) => item.status !== "Pending").reduce((sum, item) => sum + Number(item.total_amount), 0);
  const budget = shownEvents.reduce((sum, event) => sum + Number(event.approved_budget), 0);
  const expensesTotal = spent(shownExpenses);
  const revenueTotal = collected(shownRevenues);
  const pendingExpenses = shownExpenses.filter((item) => item.status === "Requested" || item.status === "Approved").reduce((sum, item) => sum + Number(item.total_amount), 0);
  const recent = [...shownExpenses.map((item) => ({ id: item.id, kind: "Expense", name: item.item_name, amount: -Number(item.total_amount), date: item.expense_date, status: item.status, eventId: item.finance_event_id })), ...shownRevenues.map((item) => ({ id: item.id, kind: "Revenue", name: item.source, amount: Number(item.total_amount), date: item.received_date, status: item.status, eventId: item.finance_event_id }))].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  async function saveEvent(form: FormData) {
    const supabase = createClient();
    const payload = {
      portal_event_id: String(form.get("portal_event_id") || "") || null,
      event_code: String(form.get("event_code") || "").trim().toUpperCase(),
      event_name: String(form.get("event_name") || "").trim(),
      event_date: String(form.get("event_date") || ""),
      person_in_charge: String(form.get("person_in_charge") || "").trim(),
      approved_budget: Number(form.get("approved_budget")),
      status: String(form.get("status")) as FinanceEvent["status"],
    };
    if (!Number.isFinite(payload.approved_budget) || payload.approved_budget < 0) throw new Error("Enter a valid approved budget.");
    const query = editingEvent ? supabase.from("finance_events").update(payload).eq("id", editingEvent.id) : supabase.from("finance_events").insert(payload);
    const { data, error: saveError } = await query.select(eventFields).single();
    if (saveError) throw saveError;
    setEvents((items) => [...items.filter((item) => item.id !== data.id), data as FinanceEvent].sort((a, b) => b.event_date.localeCompare(a.event_date)));
    setEditingEvent(null); setDialog(null); setSection("events"); setNotice("Event finances saved.");
  }

  async function uploadProof(kind: "expenses" | "revenue", id: string, file: File | null) {
    if (!file || !file.size) return null;
    if (file.size > 10 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Proof must be a PDF, JPG, PNG, or WebP under 10 MB.");
    const extension = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
    const path = `${kind}/${id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await createClient().storage.from("finance-proofs").upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    return path;
  }

  async function saveExpense(form: FormData) {
    const id = crypto.randomUUID();
    const file = form.get("proof") instanceof File ? form.get("proof") as File : null;
    const status = String(form.get("status")) as Expense["status"];
    if (["Purchased", "Reimbursed"].includes(status) && !file?.size) throw new Error("A receipt or proof of payment is required for a paid expense.");
    const quantity = Number(form.get("quantity")), unitPrice = Number(form.get("unit_price"));
    if (!(quantity > 0) || !(unitPrice >= 0)) throw new Error("Enter a valid quantity and unit price.");
    const proofPath = await uploadProof("expenses", id, file);
    const supabase = createClient();
    const payload = { id, finance_event_id: String(form.get("finance_event_id")), expense_date: String(form.get("expense_date")), item_code: String(form.get("item_code") || "").trim() || null, item_name: String(form.get("item_name")).trim(), category: String(form.get("category") || "General").trim() || "General", description: String(form.get("description") || "").trim(), quantity, unit_price: unitPrice, supplier: String(form.get("supplier") || "").trim() || null, requested_by: String(form.get("requested_by")).trim(), payment_method: String(form.get("payment_method") || "").trim() || null, proof_path: proofPath, status };
    const { data, error: saveError } = await supabase.from("finance_expenses").insert(payload).select(expenseFields).single();
    if (saveError) { if (proofPath) await supabase.storage.from("finance-proofs").remove([proofPath]); throw saveError; }
    setExpenses((items) => [data as Expense, ...items]); setDialog(null); setSection("expenses"); setNotice("Expense recorded.");
  }

  async function saveRevenue(form: FormData) {
    const id = crypto.randomUUID();
    const file = form.get("proof") instanceof File ? form.get("proof") as File : null;
    const quantity = Number(form.get("quantity") || 1), amount = Number(form.get("amount_per_unit"));
    if (!(quantity > 0) || !(amount >= 0)) throw new Error("Enter a valid quantity and amount per unit.");
    const proofPath = await uploadProof("revenue", id, file);
    const supabase = createClient();
    const payload = { id, finance_event_id: String(form.get("finance_event_id")), received_date: String(form.get("received_date")), source: String(form.get("source")).trim(), description: String(form.get("description") || "").trim(), quantity, amount_per_unit: amount, collected_by: String(form.get("collected_by")).trim(), payment_method: String(form.get("payment_method")) as Revenue["payment_method"], proof_path: proofPath, status: String(form.get("status")) as Revenue["status"] };
    const { data, error: saveError } = await supabase.from("finance_revenue").insert(payload).select(revenueFields).single();
    if (saveError) { if (proofPath) await supabase.storage.from("finance-proofs").remove([proofPath]); throw saveError; }
    setRevenues((items) => [data as Revenue, ...items]); setDialog(null); setSection("revenue"); setNotice("Revenue recorded.");
  }

  async function changeStatus(table: "finance_expenses" | "finance_revenue", id: string, status: string, proofPath: string | null) {
    if (table === "finance_expenses" && ["Purchased", "Reimbursed"].includes(status) && !proofPath) { setError("Attach proof when recording a paid expense."); return; }
    const supabase = createClient();
    if (table === "finance_expenses") {
      const { data, error: saveError } = await supabase.from("finance_expenses").update({ status }).eq("id", id).select(expenseFields).single();
      if (saveError) { setError(saveError.message); return; }
      setExpenses((items) => items.map((item) => item.id === id ? data as Expense : item));
    } else {
      const { data, error: saveError } = await supabase.from("finance_revenue").update({ status }).eq("id", id).select(revenueFields).single();
      if (saveError) { setError(saveError.message); return; }
      setRevenues((items) => items.map((item) => item.id === id ? data as Revenue : item));
    }
    setError(null);
    setNotice(`Status changed to ${status}.`);
  }

  async function openProof(path: string) {
    const { data, error: signedError } = await createClient().storage.from("finance-proofs").createSignedUrl(path, 60);
    if (signedError || !data?.signedUrl) { setError(signedError?.message || "Could not open proof."); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function attachExpenseProof(item: Expense, file: File | undefined) {
    if (!file?.size) return;
    setError(null);
    try {
      const path = await uploadProof("expenses", item.id, file);
      const supabase = createClient();
      const { data, error: saveError } = await supabase.from("finance_expenses").update({ proof_path: path }).eq("id", item.id).select(expenseFields).single();
      if (saveError) { if (path) await supabase.storage.from("finance-proofs").remove([path]); throw saveError; }
      setExpenses((items) => items.map((current) => current.id === item.id ? data as Expense : current));
      setNotice("Receipt attached.");
    } catch (cause) { setError(errorText(cause)); }
  }

  function submit(action: (form: FormData) => Promise<void>) {
    return async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault(); setSaving(true); setError(null);
      try { await action(new FormData(event.currentTarget)); } catch (cause) { setError(errorText(cause)); } finally { setSaving(false); }
    };
  }

  if (loading) return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Loading financial records…</p>;
  if (loadError) return <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{loadError}</p>;

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-xs font-black uppercase tracking-widest text-feu-teal">Executive finance</p><h2 className="mt-1 text-xl font-black text-ink">Financial management</h2><p className="mt-1 text-sm text-slate-500">Track event budgets, verified spending, collections, and receipts.</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setEditingEvent(null); setError(null); setDialog("event"); }} className="btn-green"><Plus className="h-4 w-4" /> Create event budget</button><button type="button" onClick={() => { setError(null); setDialog("expense"); }} disabled={!events.length} className="rounded-xl border border-feu-green px-4 py-2 text-sm font-bold text-feu-green disabled:opacity-40">Add expense</button><button type="button" onClick={() => { setError(null); setDialog("revenue"); }} disabled={!events.length} className="rounded-xl border border-feu-green px-4 py-2 text-sm font-bold text-feu-green disabled:opacity-40">Add revenue</button></div>
    </div>
    {events.length === 0 && <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950"><p className="font-bold">Create an event budget first</p><p className="mt-1">Add expense and Add revenue are unavailable until an event budget is saved. If your event already appears in the Events tab, link it when creating the budget.</p></div>}
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">{(["dashboard", "events", "expenses", "revenue", "room"] as Section[]).map((name) => <button key={name} type="button" onClick={() => setSection(name)} className={`rounded-lg px-4 py-2 text-sm font-bold capitalize ${section === name ? "bg-feu-moss text-white" : "text-slate-600 hover:bg-white"}`}>{name === "room" ? "SCC room" : name}</button>)}</div><label className="text-sm font-semibold text-slate-600">Event <select value={selectedEvent} onChange={(event) => setSelectedEvent(event.target.value)} className={`${inputClass} sm:ml-2 sm:mt-0 sm:w-72`}><option value="">All events</option>{events.map((item) => <option key={item.id} value={item.id}>{item.event_code} · {item.event_name}</option>)}</select></label></div>
    {section === "room" && <FinanceRoomManager events={events} teamMembers={teamMembers} currentRole={currentRole} />}
    {section === "dashboard" && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric icon={CalendarDays} label="Approved budget" value={money(budget)} /><Metric icon={Receipt} label="Actual expenses" value={money(expensesTotal)} /><Metric icon={TrendingUp} label="Collected revenue" value={money(revenueTotal)} /><Metric icon={Banknote} label="Remaining budget" value={money(budget - expensesTotal)} /><Metric icon={Banknote} label="Net event result" value={money(revenueTotal - expensesTotal)} /></div><p className="text-xs text-slate-500">Actual expenses include Purchased and Reimbursed items. Revenue includes Collected and Deposited items. Pending or approved expenses: {money(pendingExpenses)}.</p><div className="grid gap-5 xl:grid-cols-2"><Panel title="Expenses and revenue by event">{shownEvents.length ? shownEvents.map((item) => { const eventExpenses = spent(expenses.filter((expense) => expense.finance_event_id === item.id)), eventRevenue = collected(revenues.filter((revenue) => revenue.finance_event_id === item.id)); return <div key={item.id} className="border-t border-slate-100 py-3 text-sm"><div className="flex justify-between gap-3 font-bold text-ink"><span>{item.event_code} · {item.event_name}</span><span>{money(Number(item.approved_budget))} budget</span></div><div className="mt-1 flex flex-wrap gap-4 text-slate-500"><span>Expenses {money(eventExpenses)}</span><span>Revenue {money(eventRevenue)}</span><span>Net {money(eventRevenue - eventExpenses)}</span></div></div>; }) : <Empty text="Create an event budget to start tracking finances." />}</Panel><Panel title="Expenses by category">{Object.entries(shownExpenses.filter((item) => ["Purchased", "Reimbursed"].includes(item.status)).reduce<Record<string, number>>((result, item) => { result[item.category] = (result[item.category] || 0) + Number(item.total_amount); return result; }, {})).sort((a, b) => b[1] - a[1]).map(([category, amount]) => <div key={category} className="flex justify-between border-t border-slate-100 py-3 text-sm"><span>{category}</span><strong>{money(amount)}</strong></div>)}{expensesTotal === 0 && <Empty text="No paid expenses to summarize yet." />}</Panel></div><Panel title="Recent transactions">{recent.length ? recent.map((item) => <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-3 border-t border-slate-100 py-3 text-sm"><div><p className="font-bold text-ink">{item.name} <span className="font-normal text-slate-400">· {eventById.get(item.eventId)?.event_code}</span></p><p className="text-xs text-slate-500">{item.kind} · {date(item.date)} · {item.status}</p></div><strong className={item.amount < 0 ? "text-rose-700" : "text-emerald-700"}>{money(item.amount)}</strong></div>) : <Empty text="No transactions recorded yet." />}</Panel></>}
    {section === "events" && <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{shownEvents.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-feu-green/10 px-2 py-1 text-xs font-black text-feu-green">{item.event_code}</span><span className="text-xs font-bold text-slate-500">{item.status}</span></div><h3 className="mt-4 text-lg font-black text-ink">{item.event_name}</h3><p className="mt-1 text-sm text-slate-500">{date(item.event_date)} · {item.person_in_charge}</p><div className="mt-5 border-t border-slate-100 pt-4 text-sm"><p className="flex justify-between"><span>Approved budget</span><strong>{money(Number(item.approved_budget))}</strong></p><p className="mt-2 flex justify-between"><span>Actual expenses</span><strong>{money(spent(expenses.filter((expense) => expense.finance_event_id === item.id)))}</strong></p></div><button type="button" onClick={() => { setEditingEvent(item); setError(null); setDialog("event"); }} className="mt-5 text-sm font-bold text-feu-green hover:underline">Edit event information</button></article>)}{!shownEvents.length && <Empty text="No event finance records yet." />}</div>}
    {section === "expenses" && <Panel title="Event expenses">{shownExpenses.length ? shownExpenses.map((item) => <div key={item.id} className="grid gap-3 border-t border-slate-100 py-4 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="font-bold text-ink">{item.item_code ? `${item.item_code} · ` : ""}{item.item_name}</p><p className="mt-1 text-xs text-slate-500">{eventById.get(item.finance_event_id)?.event_code} · {date(item.expense_date)} · {item.category} · {item.quantity} × {money(Number(item.unit_price))}</p><p className="mt-1 text-xs text-slate-500">{item.description || "No description"} · {item.supplier || "Supplier not recorded"} · Requested by {item.requested_by} · {item.payment_method || "Payment pending"}</p></div><div className="flex flex-wrap items-center gap-2 lg:justify-end"><strong className="mr-2">{money(Number(item.total_amount))}</strong>{item.proof_path ? <button type="button" onClick={() => void openProof(item.proof_path!)} className="text-xs font-bold text-feu-green hover:underline">View proof</button> : <label className="cursor-pointer text-xs font-bold text-feu-green hover:underline">Attach proof<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(event) => void attachExpenseProof(item, event.target.files?.[0])} /></label>}<select aria-label={`Status for ${item.item_name}`} value={item.status} onChange={(event) => void changeStatus("finance_expenses", item.id, event.target.value, item.proof_path)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold">{["Requested", "Approved", "Purchased", "Reimbursed"].map((status) => <option key={status}>{status}</option>)}</select></div></div>) : <Empty text="No expenses recorded yet." />}</Panel>}
    {section === "revenue" && <Panel title="Event revenue">{shownRevenues.length ? shownRevenues.map((item) => <div key={item.id} className="grid gap-3 border-t border-slate-100 py-4 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="font-bold text-ink">{item.source}</p><p className="mt-1 text-xs text-slate-500">{eventById.get(item.finance_event_id)?.event_code} · {date(item.received_date)} · {item.quantity} × {money(Number(item.amount_per_unit))}</p><p className="mt-1 text-xs text-slate-500">{item.description || "No description"} · Collected by {item.collected_by} · {item.payment_method}</p></div><div className="flex flex-wrap items-center gap-2 lg:justify-end"><strong className="mr-2">{money(Number(item.total_amount))}</strong>{item.proof_path && <button type="button" onClick={() => void openProof(item.proof_path!)} className="text-xs font-bold text-feu-green hover:underline">View proof</button>}<select aria-label={`Status for ${item.source}`} value={item.status} onChange={(event) => void changeStatus("finance_revenue", item.id, event.target.value, item.proof_path)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold">{["Pending", "Collected", "Deposited"].map((status) => <option key={status}>{status}</option>)}</select></div></div>) : <Empty text="No revenue recorded yet." />}</Panel>}
    {dialog && <div role="dialog" aria-modal="true" aria-label={dialog === "event" ? "Event budget" : dialog === "expense" ? "Add expense" : "Add revenue"} className="fixed inset-0 z-[70] flex items-end justify-end bg-ink/50 p-0 backdrop-blur-sm sm:p-4"><div className="max-h-[96vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5"><h3 className="text-xl font-black text-ink">{dialog === "event" ? editingEvent ? "Edit event finances" : "New event budget" : dialog === "expense" ? "Record an expense" : "Record revenue"}</h3><button type="button" onClick={() => { setDialog(null); setError(null); }} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><form onSubmit={submit(dialog === "event" ? saveEvent : dialog === "expense" ? saveExpense : saveRevenue)} className="space-y-4 p-6">
      {dialog === "event" ? <><Field label="Linked portal event (optional)"><select name="portal_event_id" defaultValue={editingEvent?.portal_event_id || ""} className={inputClass}><option value="">No linked event</option>{portalEvents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Event name"><input name="event_name" required minLength={3} defaultValue={editingEvent?.event_name} className={inputClass} /></Field><Field label="Event code"><input name="event_code" required minLength={2} maxLength={40} defaultValue={editingEvent?.event_code} className={inputClass} placeholder="SCC-EVT-001" /></Field><Field label="Event date"><input name="event_date" type="date" required defaultValue={editingEvent?.event_date || today()} className={inputClass} /></Field><Field label="Person / committee in charge"><input name="person_in_charge" required minLength={2} defaultValue={editingEvent?.person_in_charge} className={inputClass} /></Field><Field label="Approved budget (₱)"><input name="approved_budget" type="number" min="0" step="0.01" required defaultValue={editingEvent?.approved_budget || 0} className={inputClass} /></Field><Field label="Event status"><select name="status" defaultValue={editingEvent?.status || "Upcoming"} className={inputClass}>{["Upcoming", "Ongoing", "Completed"].map((value) => <option key={value}>{value}</option>)}</select></Field></div></> : <><Field label="Event name / code"><select name="finance_event_id" required defaultValue={selectedEvent || events[0]?.id} className={inputClass}>{events.map((item) => <option key={item.id} value={item.id}>{item.event_code} · {item.event_name}</option>)}</select></Field>{dialog === "expense" ? <><div className="grid gap-4 sm:grid-cols-2"><Field label="Date of expense"><input name="expense_date" type="date" required defaultValue={today()} className={inputClass} /></Field><Field label="Item code (optional)"><input name="item_code" className={inputClass} /></Field><Field label="Item / service name"><input name="item_name" required minLength={2} className={inputClass} /></Field><Field label="Expense category"><input name="category" defaultValue="General" required className={inputClass} /></Field></div><Field label="Description / purpose"><textarea name="description" rows={2} className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Quantity"><input name="quantity" type="number" min="0.01" step="0.01" defaultValue="1" required className={inputClass} /></Field><Field label="Unit price (₱)"><input name="unit_price" type="number" min="0" step="0.01" required className={inputClass} /></Field><Field label="Supplier / store"><input name="supplier" className={inputClass} /></Field><Field label="Person who purchased / requested"><input name="requested_by" required minLength={2} className={inputClass} /></Field><Field label="Payment method"><input name="payment_method" className={inputClass} placeholder="Cash, GCash, bank transfer…" /></Field><Field label="Expense status"><select name="status" defaultValue="Requested" className={inputClass}>{["Requested", "Approved", "Purchased", "Reimbursed"].map((value) => <option key={value}>{value}</option>)}</select></Field></div></> : <><div className="grid gap-4 sm:grid-cols-2"><Field label="Date received"><input name="received_date" type="date" required defaultValue={today()} className={inputClass} /></Field><Field label="Revenue source"><input name="source" required minLength={2} className={inputClass} placeholder="Ticket sales, booth fees…" /></Field></div><Field label="Description"><textarea name="description" rows={2} className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Quantity"><input name="quantity" type="number" min="0.01" step="0.01" defaultValue="1" className={inputClass} /></Field><Field label="Amount per unit (₱)"><input name="amount_per_unit" type="number" min="0" step="0.01" required className={inputClass} /></Field><Field label="Person who collected"><input name="collected_by" required minLength={2} className={inputClass} /></Field><Field label="Payment method"><select name="payment_method" className={inputClass}>{["Cash", "GCash", "Bank Transfer", "Other"].map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Collection status"><select name="status" defaultValue="Pending" className={inputClass}>{["Pending", "Collected", "Deposited"].map((value) => <option key={value}>{value}</option>)}</select></Field></div></> }<Field label={dialog === "expense" ? "Receipt / payment proof" : "Proof of transaction"}><input name="proof" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className={inputClass} /><span className="mt-1 block text-xs font-normal text-slate-500">PDF or image, maximum 10 MB. Paid expenses require proof.</span></Field></>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => { setDialog(null); setError(null); }} className="px-4 py-2 text-sm font-bold text-slate-500">Cancel</button><button type="submit" disabled={saving} className="btn-green disabled:opacity-50">{saving ? "Saving…" : "Save record"}</button></div></form></div></div>}
  </div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-bold text-ink">{label}{children}</label>; }
function Empty({ text }: { text: string }) { return <p className="py-6 text-sm text-slate-500">{text}</p>; }
function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-base font-black text-ink">{title}</h3>{children}</section>; }
function Metric({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-feu-green" /><p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-ink">{value}</p></div>; }
