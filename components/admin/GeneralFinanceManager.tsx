"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TeamMember } from "./TaskDrawer";

type Budget = { id: string; term_label: string; approved_budget: number; notes: string; created_at: string };
type Expense = { id: string; general_budget_id: string; expense_date: string; item_code: string | null; item_name: string; category: string; description: string; quantity: number; unit_price: number; total_amount: number; supplier: string | null; requested_by: string; payment_method: string | null; proof_path: string | null; status: "Requested" | "Approved" | "Purchased" | "Reimbursed"; created_by: string; approved_by: string | null; approved_at: string | null };
type Dialog = "budget" | "expense" | null;
const budgetFields = "id,term_label,approved_budget,notes,created_at";
const expenseFields = "id,general_budget_id,expense_date,item_code,item_name,category,description,quantity,unit_price,total_amount,supplier,requested_by,payment_method,proof_path,status,created_by,approved_by,approved_at";
const input = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-feu-green";
const money = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
const today = () => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (name: string) => parts.find((item) => item.type === name)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export default function GeneralFinanceManager({ teamMembers, reviewerIds, currentUserId }: { teamMembers: TeamMember[]; reviewerIds: string[]; currentUserId: string | null }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const [budgetResult, expenseResult] = await Promise.all([
        supabase.from("finance_general_budgets").select(budgetFields).order("created_at", { ascending: false }),
        supabase.from("finance_expenses").select(expenseFields).not("general_budget_id", "is", null).order("expense_date", { ascending: false }),
      ]);
      if (!active) return;
      const issue = budgetResult.error ?? expenseResult.error;
      if (issue) setError(issue.message);
      else {
        setBudgets((budgetResult.data ?? []) as Budget[]);
        setExpenses((expenseResult.data ?? []) as Expense[]);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const activeBudgetId = selectedBudget || budgets[0]?.id || "";
  const activeBudget = budgets.find((budget) => budget.id === activeBudgetId);
  const shownExpenses = useMemo(() => expenses.filter((item) => item.general_budget_id === activeBudgetId), [expenses, activeBudgetId]);
  const paid = shownExpenses.filter((item) => ["Purchased", "Reimbursed"].includes(item.status)).reduce((sum, item) => sum + Number(item.total_amount), 0);
  const approved = shownExpenses.filter((item) => item.status === "Approved").reduce((sum, item) => sum + Number(item.total_amount), 0);
  const requested = shownExpenses.filter((item) => item.status === "Requested").reduce((sum, item) => sum + Number(item.total_amount), 0);
  const available = Number(activeBudget?.approved_budget ?? 0) - paid - approved;

  async function saveBudget(form: FormData) {
    const amount = Number(form.get("approved_budget"));
    if (!Number.isFinite(amount) || amount < 0) throw new Error("Enter a valid approved budget.");
    const payload = { term_label: String(form.get("term_label") || "").trim(), approved_budget: amount, notes: String(form.get("notes") || "").trim() };
    const supabase = createClient();
    const query = editingBudget ? supabase.from("finance_general_budgets").update(payload).eq("id", editingBudget.id) : supabase.from("finance_general_budgets").insert(payload);
    const { data, error: saveError } = await query.select(budgetFields).single();
    if (saveError) throw saveError;
    setBudgets((items) => [data as Budget, ...items.filter((item) => item.id !== data.id)]);
    setSelectedBudget(data.id);
    setEditingBudget(null); setDialog(null); setNotice("SCC general budget saved.");
  }

  async function saveExpense(form: FormData) {
    if (!activeBudgetId) throw new Error("Create a general budget first.");
    const id = crypto.randomUUID();
    const quantity = Number(form.get("quantity")), unitPrice = Number(form.get("unit_price"));
    if (!(quantity > 0) || !(unitPrice >= 0)) throw new Error("Enter a valid quantity and unit price.");
    const file = form.get("proof") instanceof File ? form.get("proof") as File : null;
    let proofPath: string | null = null;
    if (file?.size) proofPath = await uploadProof(id, file);
    const payload = { id, finance_event_id: null, general_budget_id: activeBudgetId, expense_date: String(form.get("expense_date")), item_code: String(form.get("item_code") || "").trim() || null, item_name: String(form.get("item_name") || "").trim(), category: String(form.get("category") || "General").trim(), description: String(form.get("description") || "").trim(), quantity, unit_price: unitPrice, supplier: String(form.get("supplier") || "").trim() || null, requested_by: String(form.get("requested_by") || "").trim(), payment_method: String(form.get("payment_method") || "").trim() || null, proof_path: proofPath, status: "Requested" };
    const supabase = createClient();
    const { data, error: saveError } = await supabase.from("finance_expenses").insert(payload).select(expenseFields).single();
    if (saveError) { if (proofPath) await supabase.storage.from("finance-proofs").remove([proofPath]); throw saveError; }
    setExpenses((items) => [data as Expense, ...items]); setDialog(null); setNotice("General expense request recorded.");
  }

  async function uploadProof(id: string, file: File) {
    if (file.size > 10 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Proof must be a PDF, JPG, PNG, or WebP under 10 MB.");
    const ext = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
    const path = `expenses/${id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await createClient().storage.from("finance-proofs").upload(path, file, { contentType: file.type });
    if (uploadError) throw uploadError;
    return path;
  }

  async function attachProof(item: Expense, file?: File) {
    if (!file?.size) return;
    setError(null);
    try {
      const path = await uploadProof(item.id, file);
      const supabase = createClient();
      const { data, error: updateError } = await supabase.from("finance_expenses").update({ proof_path: path }).eq("id", item.id).select(expenseFields).single();
      if (updateError) { await supabase.storage.from("finance-proofs").remove([path]); throw updateError; }
      setExpenses((items) => items.map((entry) => entry.id === item.id ? data as Expense : entry)); setNotice("Receipt attached.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not attach receipt."); }
  }

  async function changeStatus(item: Expense, status: Expense["status"]) {
    setError(null);
    const { data, error: updateError } = await createClient().from("finance_expenses").update({ status }).eq("id", item.id).select(expenseFields).single();
    if (updateError) { setError(updateError.message); return; }
    setExpenses((items) => items.map((entry) => entry.id === item.id ? data as Expense : entry)); setNotice(`Expense moved to ${status}.`);
  }

  async function openProof(path: string) {
    const { data, error: signedError } = await createClient().storage.from("finance-proofs").createSignedUrl(path, 60);
    if (signedError || !data?.signedUrl) { setError(signedError?.message || "Could not open proof."); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  function submit(action: (form: FormData) => Promise<void>) {
    return async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault(); setSaving(true); setError(null);
      try { await action(new FormData(event.currentTarget)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save the record."); } finally { setSaving(false); }
    };
  }

  if (loading) return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Loading SCC general finances…</p>;
  return <section className="space-y-5" aria-label="SCC general finances">
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-lg font-black text-ink">SCC general budget</h3><p className="mt-1 text-sm text-slate-600">Track council operating expenses separately from event budgets.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setEditingBudget(null); setError(null); setDialog("budget"); }} className="btn-green">Set general budget</button><button type="button" onClick={() => { setError(null); setDialog("expense"); }} disabled={!activeBudget} className="rounded-xl border border-feu-green px-4 py-2 text-sm font-bold text-feu-green disabled:opacity-40">Add general expense</button></div></div>
    {error && !dialog && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {!activeBudget ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">Set an SCC general budget to start recording council operating expenses. Event budgets remain in the Events tab.</p> : <>
      <div className="flex flex-wrap items-center gap-3"><label className="text-sm font-bold text-slate-700">Budget period <select value={activeBudgetId} onChange={(event) => setSelectedBudget(event.target.value)} className={`${input} ml-2 inline-block w-auto`}>{budgets.map((budget) => <option key={budget.id} value={budget.id}>{budget.term_label}</option>)}</select></label><button type="button" onClick={() => { setEditingBudget(activeBudget); setError(null); setDialog("budget"); }} className="text-sm font-bold text-feu-green underline">Edit budget</button></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Approved SCC budget", Number(activeBudget.approved_budget)], ["Paid general expenses", paid], ["Approved and pending payment", approved], ["Available after approvals", available]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-xl font-black text-ink">{money(Number(value))}</p></div>)}</div>
      <p className="text-sm text-slate-600">{activeBudget.notes || "No budget notes recorded."} Requested expenses awaiting approval: {money(requested)}.</p>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h4 className="text-base font-black text-ink">General expenses</h4><p className="mt-1 text-sm text-slate-600">These records follow the same separate finance verifier and receipt process as event expenses.</p><div className="mt-4 space-y-4">{shownExpenses.length ? shownExpenses.map((item) => <article key={item.id} className="border-t border-slate-100 pt-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><p className="font-bold text-ink">{item.item_code ? `${item.item_code} · ` : ""}{item.item_name}</p><p className="mt-1 text-xs text-slate-500">{date(item.expense_date)} · {item.category} · {item.quantity} × {money(Number(item.unit_price))}</p><p className="mt-1 text-xs text-slate-500">{item.description || "No description"} · Requested by {item.requested_by}</p><p className="mt-1 text-xs font-semibold text-slate-600">Status: {item.status}{item.approved_by ? ` · Verified by ${teamMembers.find((member) => member.id === item.approved_by)?.display_name || "SCC Finance Officer"}` : ""}</p></div><div className="flex flex-wrap items-center gap-2 lg:justify-end"><strong>{money(Number(item.total_amount))}</strong>{item.proof_path ? <button type="button" onClick={() => void openProof(item.proof_path!)} className="text-xs font-bold text-feu-green underline">View proof</button> : <label className="cursor-pointer text-xs font-bold text-feu-green underline">Attach receipt<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(event) => void attachProof(item, event.target.files?.[0])} /></label>}{item.status === "Requested" && (currentUserId && reviewerIds.includes(currentUserId) && currentUserId !== item.created_by ? <button type="button" onClick={() => void changeStatus(item, "Approved")} className="rounded-lg bg-feu-green px-3 py-2 text-xs font-bold text-white">Verify & approve</button> : <span className="text-xs font-semibold text-amber-800">Awaiting a separate finance verifier</span>)}{item.status === "Approved" && <><button type="button" disabled={!item.proof_path || !item.approved_by} onClick={() => void changeStatus(item, "Purchased")} className="rounded-lg border border-feu-green px-3 py-2 text-xs font-bold text-feu-green disabled:opacity-40">Mark purchased</button><button type="button" onClick={() => void changeStatus(item, "Requested")} className="text-xs font-bold text-slate-600 underline">Return to Requested</button></>}{item.status === "Purchased" && <button type="button" onClick={() => void changeStatus(item, "Reimbursed")} className="rounded-lg border border-feu-green px-3 py-2 text-xs font-bold text-feu-green">Mark reimbursed</button>}</div></div></article>) : <p className="text-sm text-slate-500">No general expenses recorded for this period.</p>}</div></div>
    </>}
    {dialog && <div role="dialog" aria-modal="true" aria-label={dialog === "budget" ? "SCC general budget" : "General expense"} className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5"><h3 className="text-xl font-black text-ink">{dialog === "budget" ? editingBudget ? "Edit SCC general budget" : "Set SCC general budget" : "Record a general expense"}</h3><button type="button" onClick={() => { setDialog(null); setError(null); }} aria-label="Close" className="text-slate-500">Close</button></div><form onSubmit={submit(dialog === "budget" ? saveBudget : saveExpense)} className="space-y-4 p-6">{dialog === "budget" ? <><label className="block text-sm font-bold text-ink">Budget period<input name="term_label" required minLength={3} maxLength={80} defaultValue={editingBudget?.term_label ?? "S.Y. 2026-2027"} className={input} /></label><label className="block text-sm font-bold text-ink">Approved SCC general budget (₱)<input name="approved_budget" type="number" min="0" step="0.01" required defaultValue={editingBudget?.approved_budget ?? ""} className={input} /></label><label className="block text-sm font-bold text-ink">Notes<textarea name="notes" rows={3} defaultValue={editingBudget?.notes ?? ""} className={input} /></label></> : <><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-ink">Expense date<input name="expense_date" type="date" required defaultValue={today()} className={input} /></label><label className="block text-sm font-bold text-ink">Item code optional<input name="item_code" className={input} /></label><label className="block text-sm font-bold text-ink">Item or service<input name="item_name" required minLength={2} className={input} /></label><label className="block text-sm font-bold text-ink">Category<input name="category" required defaultValue="General" className={input} /></label></div><label className="block text-sm font-bold text-ink">Description or purpose<textarea name="description" rows={2} className={input} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-ink">Quantity<input name="quantity" type="number" min="0.01" step="0.01" required defaultValue="1" className={input} /></label><label className="block text-sm font-bold text-ink">Unit price (₱)<input name="unit_price" type="number" min="0" step="0.01" required className={input} /></label><label className="block text-sm font-bold text-ink">Supplier or store<input name="supplier" className={input} /></label><label className="block text-sm font-bold text-ink">Person requesting<input name="requested_by" required minLength={2} className={input} /></label><label className="block text-sm font-bold text-ink">Payment method<input name="payment_method" className={input} /></label></div><label className="block text-sm font-bold text-ink">Receipt or proof optional<input name="proof" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className={input} /></label><p className="text-xs text-slate-600">New expenses start as Requested. A separate SCC Finance Officer must verify them. Attach a receipt before marking a purchase.</p></>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => { setDialog(null); setError(null); }} className="px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button type="submit" disabled={saving} className="btn-green disabled:opacity-50">{saving ? "Saving…" : "Save record"}</button></div></form></div></div>}
  </section>;
}
