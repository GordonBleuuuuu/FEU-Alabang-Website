"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";

export type EventPass = {
  id: string;
  pass_code: string;
  verification_token: string;
  holder_name: string;
  holder_role: string;
  membership_group: "Executive" | "Committee";
  photo_url: string | null;
  term_label: string;
  status: "active" | "revoked";
  expires_at: string | null;
  created_at: string;
};

const columns = "id,pass_code,verification_token,holder_name,holder_role,membership_group,photo_url,term_label,status,expires_at,created_at";

export default function PassManager({ initialPasses }: { initialPasses: EventPass[] }) {
  const [passes, setPasses] = useState(initialPasses);
  const [editing, setEditing] = useState<EventPass | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function issuePass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = event.currentTarget;
    const fields = new FormData(form);
    const expires = String(fields.get("expires_at") ?? "");
    const photo = String(fields.get("photo_url") ?? "").trim();
    if (photo && !photo.startsWith("/officers/") && !photo.startsWith("https://")) {
      setMessage("Photo must be an HTTPS URL or a path under /officers/.");
      setBusy(false);
      return;
    }

    const supabase = createClient();
    const values = {
      holder_name: String(fields.get("holder_name") ?? "").trim(),
      holder_role: String(fields.get("holder_role") ?? "").trim(),
      membership_group: String(fields.get("membership_group") ?? "Committee"),
      term_label: String(fields.get("term_label") ?? "S.Y. 2026–2027").trim(),
      photo_url: photo || null,
      expires_at: expires ? new Date(expires).toISOString() : null,
    };
    const query = editing
      ? supabase.from("scc_ids").update(values).eq("id", editing.id)
      : supabase.from("scc_ids").insert(values);
    const { data, error } = await query.select(columns).single();
    setBusy(false);
    if (error) {
      setMessage(`Could not save SCC ID: ${error.message}`);
      return;
    }
    setPasses((current) => editing
      ? current.map((item) => item.id === editing.id ? data as EventPass : item)
      : [...current, data as EventPass]);
    setMessage(editing ? `Updated ${data.pass_code}.` : `Issued ${data.pass_code} for ${data.holder_name}. Download the QR code below.`);
    setEditing(null);
    form.reset();
  }

  async function changeStatus(pass: EventPass) {
    const nextStatus = pass.status === "active" ? "revoked" : "active";
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    const { data, error } = await supabase.from("scc_ids")
      .update({ status: nextStatus })
      .eq("id", pass.id)
      .select(columns)
      .single();
    setBusy(false);
    if (error) {
      setMessage(`Could not update pass: ${error.message}`);
      return;
    }
    setPasses((current) => current.map((item) => item.id === pass.id ? data as EventPass : item));
    setMessage(`${data.pass_code} is now ${nextStatus}.`);
  }

  return <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
    <form key={editing?.id ?? "new"} onSubmit={issuePass} className="h-fit space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-ink">{editing ? `Edit ${editing.pass_code}` : "Add an SCC ID"}</h2>
      <Field name="holder_name" label="Full name" placeholder="Name to print on the ID" defaultValue={editing?.holder_name} required />
      <Field name="holder_role" label="SCC role" placeholder="e.g. Creatives Committee Member" defaultValue={editing?.holder_role} required />
      <label className="block text-sm font-bold text-slate-700">Group
        <select name="membership_group" defaultValue={editing?.membership_group ?? "Committee"} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-ink focus:border-feu-green focus:outline-none"><option value="Committee">Committee</option><option value="Executive">Executive</option></select>
      </label>
      <Field name="term_label" label="Term" defaultValue={editing?.term_label ?? "S.Y. 2026–2027"} required />
      <Field name="photo_url" label="Photo URL or /officers/ path" placeholder="/officers/Kendrick.jpg" defaultValue={editing?.photo_url ?? ""} />
      <label className="block text-sm font-bold text-slate-700">Expires at (optional)
        <input name="expires_at" type="datetime-local" defaultValue={editing?.expires_at ? toLocalDateTime(editing.expires_at) : ""} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-ink focus:border-feu-green focus:outline-none" />
      </label>
      <button disabled={busy} className="btn-green w-full disabled:opacity-50">{busy ? "Saving…" : editing ? "Save changes" : "Add SCC ID"}</button>
      {editing && <button type="button" onClick={() => setEditing(null)} className="w-full text-sm font-bold text-slate-500 hover:underline">Cancel editing</button>}
      <p className="text-xs leading-5 text-slate-500">Use the holder’s confirmed full name and photo before printing. The QR will contain a private verification link, not their personal details.</p>
    </form>
    <section aria-label="SCC IDs">
      <div className="flex items-end justify-between gap-3"><h2 className="text-xl font-black text-ink">SCC roster</h2><span className="text-sm font-semibold text-slate-500">{passes.length} total</span></div>
      {message && <p role="status" className="mt-4 rounded-xl border border-feu-green/20 bg-feu-green/5 px-4 py-3 text-sm font-semibold text-feu-green">{message}</p>}
      <p className="mt-3 text-sm leading-6 text-slate-600">Download these website QR codes for the ID design. Earlier code-only QR images will not open the verification page.</p>
      <div className="mt-5 space-y-4">
        {passes.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No SCC IDs yet.</p>}
        {passes.map((pass) => <PassCard key={pass.id} pass={pass} busy={busy} onEdit={() => setEditing(pass)} onStatusChange={() => changeStatus(pass)} />)}
      </div>
    </section>
  </div>;
}

function Field({ name, label, placeholder, defaultValue, required = false }: { name: string; label: string; placeholder?: string; defaultValue?: string; required?: boolean }) {
  return <label className="block text-sm font-bold text-slate-700">{label}<input name={name} type="text" placeholder={placeholder} defaultValue={defaultValue} required={required} maxLength={160} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-ink placeholder:text-slate-400 focus:border-feu-green focus:outline-none" /></label>;
}

function toLocalDateTime(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function PassCard({ pass, busy, onEdit, onStatusChange }: { pass: EventPass; busy: boolean; onEdit: () => void; onStatusChange: () => void }) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState("");
  useEffect(() => {
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
    const url = `${origin}/verify/${pass.verification_token}`;
    setVerifyUrl(url);
    QRCode.toDataURL(url, { width: 512, margin: 3, errorCorrectionLevel: "H" }).then(setQrImage);
  }, [pass.verification_token]);
  return <article className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2"><span className="font-black text-feu-green">{pass.pass_code}</span><span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${pass.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{pass.status === "revoked" ? "Revoked" : "Not revoked"}</span></div>
      <h3 className="mt-2 text-lg font-black text-ink">{pass.holder_name}</h3>
      <p className="text-sm font-semibold text-slate-600">{pass.holder_role}</p>
      <p className="mt-2 text-sm text-slate-500">{pass.membership_group} · {pass.term_label}</p>
      {pass.expires_at && <p className="mt-1 text-xs text-slate-500">Expires {new Date(pass.expires_at).toLocaleString("en-PH")}</p>}
      {!pass.photo_url && <p className="mt-2 text-xs font-semibold text-amber-700">No photo on record; visual identity check will be limited.</p>}
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
        <a href={verifyUrl || "#"} target="_blank" rel="noreferrer" className="text-feu-green hover:underline">Open verification</a>
        <button type="button" disabled={busy} onClick={onEdit} className="text-feu-green hover:underline disabled:opacity-50">Edit details</button>
        <button type="button" disabled={busy} onClick={onStatusChange} className="text-slate-600 hover:underline disabled:opacity-50">{pass.status === "active" ? "Revoke ID" : "Restore ID"}</button>
      </div>
    </div>
    <div className="w-40 shrink-0 text-center">
      {qrImage ? <><Image src={qrImage} alt={`Verification QR for ${pass.pass_code}`} width={160} height={160} unoptimized className="mx-auto rounded-lg border border-slate-200" /><a href={qrImage} download={`${pass.pass_code}.png`} className="mt-2 inline-block text-xs font-black text-feu-green hover:underline">Download QR PNG</a></> : <div className="grid h-40 place-items-center rounded-lg bg-slate-100 text-xs text-slate-500">Generating QR…</div>}
    </div>
  </article>;
}
