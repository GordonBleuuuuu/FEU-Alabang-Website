"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FileText, History, MessageSquare, Paperclip, Save, Send, Trash2, Upload, X } from "lucide-react";
import type { BoardTask, TaskLabel, TaskPriority, TaskStatus } from "./AdminBoard";
import { createClient } from "@/lib/supabase/client";

export type TeamMember = { id: string; display_name: string | null; email: string; role: "SCC Executive" | "SADU" | "Public" };
export type LinkableEvent = { id: string; title: string; organizer_name: string; status: string };
type Comment = { id: string; body: string; author_id: string; created_at: string };
type Attachment = { id: string; file_name: string; storage_path: string; mime_type: string | null; size_bytes: number | null; uploaded_by: string; created_at: string };
type Activity = { id: number; actor_id: string | null; action: string; old_data: Record<string, unknown> | null; new_data: Record<string, unknown> | null; created_at: string };

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-feu-green focus:ring-2 focus:ring-feu-green/15";

export default function TaskDrawer({ task, teamMembers, events, onClose, onTaskUpdated, onTaskDeleted }: {
  task: BoardTask; teamMembers: TeamMember[]; events: LinkableEvent[]; onClose: () => void; onTaskUpdated: (task: BoardTask) => void; onTaskDeleted: (task: BoardTask) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [availableLabels, setAvailableLabels] = useState<TaskLabel[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(task.labels.map((label) => label.id));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [values, setValues] = useState({ title: task.title, description: task.description, status: task.status, priority: task.priority, due_at: toLocalInput(task.due_at), assignee_id: task.assignee_id ?? "", event_id: task.event_id ?? "" });
  const membersById = useMemo(() => new Map(teamMembers.map((member) => [member.id, member])), [teamMembers]);

  const loadCollaboration = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    const [commentsResult, attachmentsResult, activityResult, labelsResult, linksResult] = await Promise.all([
      supabase.from("task_comments").select("id,body,author_id,created_at").eq("task_id", task.id).order("created_at"),
      supabase.from("task_attachments").select("id,file_name,storage_path,mime_type,size_bytes,uploaded_by,created_at").eq("task_id", task.id).order("created_at", { ascending: false }),
      supabase.from("task_activity").select("id,actor_id,action,old_data,new_data,created_at").eq("task_id", task.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("task_labels").select("id,name,color").order("name"),
      supabase.from("task_label_links").select("label_id").eq("task_id", task.id),
    ]);
    const loadError = commentsResult.error ?? attachmentsResult.error ?? activityResult.error ?? labelsResult.error ?? linksResult.error;
    if (loadError) setError(loadError.message);
    else { setComments((commentsResult.data ?? []) as Comment[]); setAttachments((attachmentsResult.data ?? []) as Attachment[]); setActivity((activityResult.data ?? []) as Activity[]); setAvailableLabels((labelsResult.data ?? []) as TaskLabel[]); setSelectedLabelIds((linksResult.data ?? []).map((link) => link.label_id)); }
    setLoading(false);
  }, [task.id]);

  useEffect(() => { void loadCollaboration(); }, [loadCollaboration]);

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null);
    const supabase = createClient();
    const { data, error: updateError } = await supabase.from("tasks").update({
      title: values.title.trim(), description: values.description, status: values.status,
      priority: values.priority, due_at: values.due_at ? new Date(values.due_at).toISOString() : null,
      assignee_id: values.assignee_id || null, event_id: values.event_id || null,
    }).eq("id", task.id).select("id,task_key,title,description,status,priority,assignee_id,due_at,position,event_id").single();
    if (updateError) { setError(updateError.message); setSaving(false); return; }
    const { error: unlinkError } = await supabase.from("task_label_links").delete().eq("task_id", task.id);
    if (unlinkError) { setError(unlinkError.message); setSaving(false); return; }
    if (selectedLabelIds.length) {
      const { error: linkError } = await supabase.from("task_label_links").insert(selectedLabelIds.map((label_id) => ({ task_id: task.id, label_id })));
      if (linkError) { setError(linkError.message); setSaving(false); return; }
    }
    const labels = availableLabels.filter((label) => selectedLabelIds.includes(label.id));
    onTaskUpdated({ ...(data as BoardTask), labels });
    await loadCollaboration();
    setSaving(false);
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!comment.trim()) return;
    setCommenting(true); setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("task_comments").insert({ task_id: task.id, body: comment.trim() });
    if (insertError) setError(insertError.message); else { setComment(""); await loadCollaboration(); }
    setCommenting(false);
  }

  async function uploadAttachment(file: File | null) {
    if (!file) return;
    setUploading(true); setError(null);
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100);
    const path = `${task.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: storageError } = await supabase.storage.from("task-documents").upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
    if (storageError) { setError(storageError.message); setUploading(false); return; }
    const { error: rowError } = await supabase.from("task_attachments").insert({ task_id: task.id, file_name: file.name, storage_path: path, mime_type: file.type || null, size_bytes: file.size });
    if (rowError) setError(rowError.message); else await loadCollaboration();
    setUploading(false);
  }

  async function openAttachment(attachment: Attachment) {
    const supabase = createClient();
    const { data, error: signedUrlError } = await supabase.storage.from("task-documents").createSignedUrl(attachment.storage_path, 60);
    if (signedUrlError || !data?.signedUrl) { setError(signedUrlError?.message ?? "Could not open the attachment."); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function deleteTask() {
    setDeleting(true); setError(null);
    const supabase = createClient();
    const { data: taskFiles, error: filesError } = await supabase.from("task_attachments").select("storage_path").eq("task_id", task.id);
    if (filesError) { setError(filesError.message); setDeleting(false); return; }
    if (taskFiles?.length) {
      const { error: storageError } = await supabase.storage.from("task-documents").remove(taskFiles.map((item) => item.storage_path));
      if (storageError) { setError(storageError.message); setDeleting(false); return; }
    }
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", task.id);
    if (deleteError) { setError(deleteError.message); setDeleting(false); return; }
    onTaskDeleted(task);
  }

  return <div className="fixed inset-0 z-[60] flex justify-end bg-ink/45 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Task SCC-${task.task_key}`}><aside className="flex h-full w-full max-w-2xl flex-col bg-cloud shadow-2xl"><header className="flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5"><div><p className="text-xs font-black text-feu-teal">SCC-{task.task_key}</p><h2 className="mt-1 text-xl font-black text-ink">Task details</h2></div><div className="flex items-center gap-2"><button type="button" onClick={() => setShowDeleteConfirmation(true)} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Close task details"><X className="h-5 w-5" /></button></div></header><div className="flex-1 overflow-y-auto p-6">
    {showDeleteConfirmation && <section className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5"><h3 className="font-black text-red-900">Delete this task permanently?</h3><p className="mt-2 text-sm leading-6 text-red-800">Comments, activity records, and attached files will be deleted. Type <strong>DELETE</strong> to continue.</p><input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="mt-4 w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm" autoComplete="off" /><div className="mt-4 flex justify-end gap-3"><button type="button" onClick={() => { setShowDeleteConfirmation(false); setDeleteConfirmation(""); }} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600">Keep task</button><button type="button" disabled={deleteConfirmation !== "DELETE" || deleting} onClick={() => void deleteTask()} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{deleting ? "Deleting…" : "Delete permanently"}</button></div></section>}
    <form onSubmit={saveTask} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Field label="Task title"><input value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} required minLength={3} className={inputClass} /></Field><Field label="Description"><textarea value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} rows={5} className={inputClass} placeholder="Describe the outcome, context, or acceptance criteria…" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Status"><select value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as TaskStatus })} className={inputClass}>{["backlog", "todo", "in_progress", "review", "done"].map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></Field><Field label="Priority"><select value={values.priority} onChange={(event) => setValues({ ...values, priority: event.target.value as TaskPriority })} className={inputClass}>{["lowest", "low", "medium", "high", "highest"].map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Designated person"><select value={values.assignee_id} onChange={(event) => setValues({ ...values, assignee_id: event.target.value })} className={inputClass}><option value="">Unassigned</option>{teamMembers.filter((member) => member.role !== "Public").map((member) => <option key={member.id} value={member.id}>{member.display_name || member.email} · {member.role}</option>)}</select></Field><Field label="Due date"><input type="datetime-local" value={values.due_at} onChange={(event) => setValues({ ...values, due_at: event.target.value })} className={inputClass} /></Field></div><Field label="Linked event"><select value={values.event_id} onChange={(event) => setValues({ ...values, event_id: event.target.value })} className={inputClass}><option value="">No linked event</option>{events.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.organizer_name}</option>)}</select></Field><fieldset><legend className="text-sm font-bold text-ink">Labels</legend><div className="mt-2 flex flex-wrap gap-2">{availableLabels.map((label) => <label key={label.id} className="cursor-pointer"><input type="checkbox" checked={selectedLabelIds.includes(label.id)} onChange={(event) => setSelectedLabelIds((selected) => event.target.checked ? [...selected, label.id] : selected.filter((id) => id !== label.id))} className="sr-only" /><span className={`inline-block rounded-full border px-3 py-1.5 text-xs font-bold ${selectedLabelIds.includes(label.id) ? "border-transparent" : "border-slate-200 bg-white text-slate-500"}`} style={selectedLabelIds.includes(label.id) ? { backgroundColor: `${label.color}1A`, color: label.color } : undefined}>{label.name}</span></label>)}</div></fieldset><div className="flex justify-end border-t border-slate-100 pt-4"><button type="submit" disabled={saving} className="btn-green disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save task"}</button></div></form>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 font-black text-ink"><MessageSquare className="h-4 w-4 text-feu-green" /> Comments</h3><form onSubmit={addComment} className="mt-4 flex gap-2"><input value={comment} onChange={(event) => setComment(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Add an update or handoff note…" /><button type="submit" disabled={!comment.trim() || commenting} className="btn-green px-3"><Send className="h-4 w-4" /></button></form><div className="mt-5 space-y-4">{loading ? <p className="text-sm text-slate-400">Loading discussion…</p> : comments.length ? comments.map((item) => <article key={item.id} className="border-t border-slate-100 pt-4"><p className="text-xs font-black text-feu-teal">{memberName(membersById, item.author_id)}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.body}</p><p className="mt-2 text-xs text-slate-400">{formatDate(item.created_at)}</p></article>) : <p className="text-sm text-slate-500">No comments yet.</p>}</div></section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><h3 className="flex items-center gap-2 font-black text-ink"><Paperclip className="h-4 w-4 text-feu-green" /> Attachments</h3><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-feu-green/25 px-3 py-2 text-xs font-bold text-feu-green"><Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp,.docx,.xlsx" className="sr-only" disabled={uploading} onChange={(event) => void uploadAttachment(event.target.files?.[0] ?? null)} /></label></div><div className="mt-4 space-y-2">{loading ? <p className="text-sm text-slate-400">Loading attachments…</p> : attachments.length ? attachments.map((attachment) => <button key={attachment.id} type="button" onClick={() => void openAttachment(attachment)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-feu-green/35"><span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-feu-green" /><span className="truncate text-sm font-semibold text-ink">{attachment.file_name}</span></span><span className="text-xs text-slate-400">{formatBytes(attachment.size_bytes)}</span></button>) : <p className="text-sm text-slate-500">No attachments yet.</p>}</div></section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="flex items-center gap-2 font-black text-ink"><History className="h-4 w-4 text-feu-green" /> Activity</h3><div className="mt-4 space-y-4">{loading ? <p className="text-sm text-slate-400">Loading activity…</p> : activity.length ? activity.map((item) => <div key={item.id} className="border-l-2 border-feu-green/20 pl-4"><p className="text-sm font-semibold text-ink">{memberName(membersById, item.actor_id)} <span className="font-normal text-slate-500">{activityMessage(item)}</span></p><p className="mt-1 text-xs text-slate-400">{formatDate(item.created_at)}</p></div>) : <p className="text-sm text-slate-500">No activity yet.</p>}</div></section>
  </div></aside></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-ink">{label}{children}</label>; }
function memberName(members: Map<string, TeamMember>, id: string | null) { if (!id) return "System"; const member = members.get(id); return member?.display_name || member?.email || "Unknown user"; }
function activityMessage(activity: Activity) { if (activity.action === "created") return "created this task"; if (activity.action === "status_changed") return `moved it from ${String(activity.old_data?.status ?? "a previous status").replace("_", " ")} to ${String(activity.new_data?.status ?? "a new status").replace("_", " ")}`; return "updated this task"; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function formatBytes(value: number | null) { if (!value) return ""; return value < 1024 * 1024 ? `${Math.ceil(value / 1024)} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`; }
function toLocalInput(value: string | null) { if (!value) return ""; const date = new Date(value); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); }
