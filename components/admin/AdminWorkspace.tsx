"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Bell, CalendarDays, CheckCircle2, ClipboardList, LayoutDashboard, MapPin, Pencil, Plus, Send, Sparkles, Upload, X } from "lucide-react";
import AdminBoard, { type BoardTask, type TaskPriority, type TaskStatus } from "./AdminBoard";
import { createClient } from "@/lib/supabase/client";

export type AppRole = "SCC Executive" | "SADU";
export type EventStatus = "draft" | "submitted" | "needs_changes" | "approved" | "published" | "completed" | "cancelled";
export type Organization = { id: string; name: string; acronym: string; slug: string };
export type ManagedEvent = {
  id: string; title: string; slug: string; description: string; organizer_name: string;
  organization_id: string; venue: string | null; starts_at: string; ends_at: string;
  status: EventStatus; is_public: boolean; registration_url: string | null; image_url: string | null;
  category: string; contact_name: string | null; contact_email: string | null;
  capacity: number | null; review_notes: string | null;
};
export type Notification = { id: string; title: string; message: string; event_id: string | null; read_at: string | null; created_at: string };
type Conflict = { event_id: string; event_title: string; event_venue: string | null; event_starts_at: string; event_ends_at: string; conflict_type: "venue" | "schedule" };
type EventValues = Omit<ManagedEvent, "id" | "slug" | "status" | "image_url">;
type View = "overview" | "board" | "events" | "notifications";

const tabs: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "board", label: "Project board", icon: ClipboardList },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "notifications", label: "Notifications", icon: Bell },
];
const eventSelect = "id,title,slug,description,organizer_name,organization_id,venue,starts_at,ends_at,status,is_public,registration_url,image_url,category,contact_name,contact_email,capacity,review_notes";
const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-feu-green focus:ring-2 focus:ring-feu-green/15";

export default function AdminWorkspace({ currentRole, initialTasks, initialEvents, organizations, initialNotifications }: {
  currentRole: AppRole; initialTasks: BoardTask[]; initialEvents: ManagedEvent[];
  organizations: Organization[]; initialNotifications: Notification[];
}) {
  const [view, setView] = useState<View>("overview");
  const [tasks, setTasks] = useState(initialTasks);
  const [events, setEvents] = useState(initialEvents);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ManagedEvent | "new" | null>(null);
  const [viewingEvent, setViewingEvent] = useState<ManagedEvent | null>(null);
  const [conflictReview, setConflictReview] = useState<{ event: ManagedEvent; conflicts: Conflict[] } | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const metrics = useMemo(() => ({
    openTasks: tasks.filter((task) => task.status !== "done").length,
    awaitingReview: events.filter((event) => event.status === "submitted").length,
    publishedEvents: events.filter((event) => event.status === "published").length,
    draftEvents: events.filter((event) => ["draft", "needs_changes"].includes(event.status)).length,
  }), [events, tasks]);

  function showNotice(kind: "success" | "error", text: string) {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 5000);
  }

  async function createTask(values: { title: string; description: string; status: TaskStatus; priority: TaskPriority; due_at: string | null }) {
    const supabase = createClient();
    const position = tasks.filter((task) => task.status === values.status).length;
    const { data, error } = await supabase.from("tasks").insert({ ...values, position }).select("id,task_key,title,description,status,priority,assignee_id,due_at,position").single();
    if (error) throw error;
    setTasks((current) => [...current, data as BoardTask]);
    setShowTaskForm(false); setView("board"); showNotice("success", `Task SCC-${data.task_key} created.`);
  }

  async function uploadEventFiles(eventId: string, poster: File | null, documents: File[]) {
    const supabase = createClient();
    if (poster?.size) {
      const extension = poster.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${eventId}/poster-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("event-posters").upload(path, poster, { contentType: poster.type, upsert: false });
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from("event-posters").getPublicUrl(path);
      const { error: imageError } = await supabase.from("events").update({ image_url: publicUrl.publicUrl }).eq("id", eventId);
      if (imageError) throw imageError;
      const { error: attachmentError } = await supabase.from("event_attachments").insert({ event_id: eventId, kind: "poster", file_name: poster.name, storage_bucket: "event-posters", storage_path: path, mime_type: poster.type, size_bytes: poster.size });
      if (attachmentError) throw attachmentError;
    }
    for (const document of documents.filter((file) => file.size)) {
      const extension = document.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `${eventId}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("event-documents").upload(path, document, { contentType: document.type, upsert: false });
      if (error) throw error;
      const { error: rowError } = await supabase.from("event_attachments").insert({ event_id: eventId, kind: "other", file_name: document.name, storage_bucket: "event-documents", storage_path: path, mime_type: document.type, size_bytes: document.size });
      if (rowError) throw rowError;
    }
  }

  async function saveEvent(values: EventValues, poster: File | null, documents: File[]) {
    const supabase = createClient();
    const organization = organizations.find((item) => item.id === values.organization_id);
    const payload = { ...values, organizer_name: organization?.acronym || organization?.name || "RSO" };
    let saved: ManagedEvent;
    if (editingEvent && editingEvent !== "new") {
      const nextStatus = editingEvent.status === "needs_changes" && currentRole === "SCC Executive" ? "draft" : editingEvent.status;
      const { data, error } = await supabase.from("events").update({ ...payload, status: nextStatus }).eq("id", editingEvent.id).select(eventSelect).single();
      if (error) throw error;
      saved = data as ManagedEvent;
      showNotice("success", nextStatus === "draft" && editingEvent.status === "needs_changes" ? "Changes saved as a new draft." : "Event updated.");
    } else {
      const id = crypto.randomUUID();
      const baseSlug = values.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { data, error } = await supabase.from("events").insert({ id, ...payload, slug: `${baseSlug || "event"}-${id.slice(0, 8)}`, status: "draft", image_url: null }).select(eventSelect).single();
      if (error) throw error;
      saved = data as ManagedEvent; showNotice("success", "Event draft created.");
    }
    await uploadEventFiles(saved.id, poster, documents);
    if (poster?.size) {
      const { data } = await supabase.from("events").select(eventSelect).eq("id", saved.id).single();
      if (data) saved = data as ManagedEvent;
    }
    setEvents((current) => [...current.filter((event) => event.id !== saved.id), saved].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
    setEditingEvent(null); setView("events");
  }

  async function updateStatus(event: ManagedEvent, status: EventStatus, reviewNotes?: string | null) {
    const supabase = createClient();
    const payload = reviewNotes !== undefined ? { status, review_notes: reviewNotes } : { status };
    const { data, error } = await supabase.from("events").update(payload).eq("id", event.id).select(eventSelect).single();
    if (error) return showNotice("error", error.message);
    setEvents((current) => current.map((item) => item.id === event.id ? data as ManagedEvent : item));
    showNotice("success", `Event moved to ${status.replace("_", " ")}.`);
  }

  async function prepareSubmission(event: ManagedEvent) {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("find_event_conflicts", { candidate_starts_at: event.starts_at, candidate_ends_at: event.ends_at, candidate_venue: event.venue ?? "", excluded_event_id: event.id });
    if (error) return showNotice("error", error.message);
    const conflicts = (data ?? []) as Conflict[];
    if (conflicts.length) setConflictReview({ event, conflicts }); else void updateStatus(event, "submitted");
  }

  async function markNotificationRead(notification: Notification) {
    if (notification.read_at) return;
    const supabase = createClient(); const readAt = new Date().toISOString();
    const { error } = await supabase.from("notifications").update({ read_at: readAt }).eq("id", notification.id);
    if (!error) setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read_at: readAt } : item));
  }

  async function openNotification(notification: Notification) {
    await markNotificationRead(notification);
    const linkedEvent = events.find((event) => event.id === notification.event_id);
    if (!linkedEvent) {
      showNotice("error", "The event linked to this notification is no longer available.");
      return;
    }
    setViewingEvent(linkedEvent);
  }

  const unread = notifications.filter((item) => !item.read_at).length;
  return <div>
    <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex overflow-x-auto">{tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} type="button" onClick={() => setView(tab.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${view === tab.id ? "bg-feu-moss text-white" : "text-slate-500 hover:bg-slate-100 hover:text-ink"}`}><Icon className="h-4 w-4" />{tab.label}{tab.id === "notifications" && unread > 0 && <span className="rounded-full bg-gold-default px-1.5 py-0.5 text-[0.6rem] text-feu-moss">{unread}</span>}</button>; })}</div>
      <div className="flex gap-2"><button type="button" onClick={() => setShowTaskForm(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-feu-green/25 px-4 py-2.5 text-sm font-bold text-feu-green hover:bg-feu-green/5 sm:flex-none"><Plus className="h-4 w-4" /> New task</button><button type="button" onClick={() => setEditingEvent("new")} disabled={!organizations.length} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-default px-4 py-2.5 text-sm font-bold text-feu-moss shadow-gold hover:-translate-y-0.5 disabled:opacity-50 sm:flex-none"><Plus className="h-4 w-4" /> New event</button></div>
    </div>
    {notice && <div role="status" className={`fixed right-5 top-5 z-[70] max-w-sm rounded-2xl px-5 py-4 text-sm font-semibold shadow-xl ${notice.kind === "success" ? "bg-feu-moss text-white" : "bg-red-600 text-white"}`}>{notice.text}</div>}
    {view === "overview" && <Overview metrics={metrics} tasks={tasks} events={events} role={currentRole} onOpenBoard={() => setView("board")} onOpenEvents={() => setView("events")} />}
    {view === "board" && <AdminBoard tasks={tasks} onTasksChange={setTasks} onError={(message) => showNotice("error", message)} />}
    {view === "events" && <EventManager role={currentRole} events={events} onEdit={setEditingEvent} onStatusChange={updateStatus} onSubmit={prepareSubmission} onCreate={() => setEditingEvent("new")} />}
    {view === "notifications" && <NotificationCenter notifications={notifications} onOpen={openNotification} />}
    {showTaskForm && <TaskForm onClose={() => setShowTaskForm(false)} onSave={createTask} />}
    {editingEvent && <EventForm event={editingEvent === "new" ? null : editingEvent} organizations={organizations} onClose={() => setEditingEvent(null)} onSave={saveEvent} />}
    {viewingEvent && <EventDetailsDialog event={viewingEvent} onClose={() => setViewingEvent(null)} onOpenActions={() => { setViewingEvent(null); setView("events"); }} />}
    {conflictReview && <ConflictDialog review={conflictReview} onClose={() => setConflictReview(null)} onContinue={() => { void updateStatus(conflictReview.event, "submitted"); setConflictReview(null); }} />}
  </div>;
}

function Overview({ metrics, tasks, events, role, onOpenBoard, onOpenEvents }: { metrics: { openTasks: number; awaitingReview: number; publishedEvents: number; draftEvents: number }; tasks: BoardTask[]; events: ManagedEvent[]; role: AppRole; onOpenBoard: () => void; onOpenEvents: () => void }) {
  const cards = [
    { label: "Open tasks", value: metrics.openTasks, icon: ClipboardList, color: "bg-feu-green/10 text-feu-green" },
    { label: role === "SADU" ? "Awaiting SADU review" : "Submitted for review", value: metrics.awaitingReview, icon: Sparkles, color: "bg-sky-100 text-sky-700" },
    { label: "Published events", value: metrics.publishedEvents, icon: CheckCircle2, color: "bg-gold-default/20 text-feu-moss" },
    { label: "Drafts / changes", value: metrics.draftEvents, icon: CalendarDays, color: "bg-slate-100 text-slate-600" },
  ];
  return <div className="space-y-7"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className={`grid h-11 w-11 place-items-center rounded-xl ${card.color}`}><Icon className="h-5 w-5" /></div><p className="mt-5 text-3xl font-black text-ink">{card.value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{card.label}</p></article>; })}</div><div className="grid gap-5 lg:grid-cols-2"><OverviewPanel title="Project activity" empty={!tasks.length} emptyText="Create your first task to start tracking council work." action="Open project board" onAction={onOpenBoard}>{tasks.slice(0, 4).map((task) => <div key={task.id} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"><div><p className="text-sm font-bold text-ink">{task.title}</p><p className="mt-1 text-xs text-slate-500">SCC-{task.task_key} · {task.status.replace("_", " ")}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-bold uppercase text-slate-600">{task.priority}</span></div>)}</OverviewPanel><OverviewPanel title="Event pipeline" empty={!events.length} emptyText="Create an event draft to begin the SADU approval workflow." action="Manage events" onAction={onOpenEvents}>{events.slice(0, 4).map((event) => <div key={event.id} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"><div><p className="text-sm font-bold text-ink">{event.title}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(event.starts_at))}</p></div><EventStatus status={event.status} /></div>)}</OverviewPanel></div></div>;
}

function OverviewPanel({ title, empty, emptyText, action, onAction, children }: { title: string; empty: boolean; emptyText: string; action: string; onAction: () => void; children: ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-black text-ink">{title}</h2><button type="button" onClick={onAction} className="text-xs font-bold text-feu-green hover:underline">{action}</button></div>{empty ? <p className="mt-8 rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">{emptyText}</p> : <div className="mt-4">{children}</div>}</section>; }

function EventManager({ role, events, onEdit, onStatusChange, onSubmit, onCreate }: { role: AppRole; events: ManagedEvent[]; onEdit: (event: ManagedEvent) => void; onStatusChange: (event: ManagedEvent, status: EventStatus, notes?: string | null) => void; onSubmit: (event: ManagedEvent) => void; onCreate: () => void }) {
  if (!events.length) return <div className="rounded-3xl border border-dashed border-feu-green/25 bg-white px-6 py-20 text-center"><CalendarDays className="mx-auto h-12 w-12 text-feu-green" /><h2 className="mt-5 text-xl font-black text-ink">No events yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Create an RSO event draft and send it through SADU approval.</p><button type="button" onClick={onCreate} className="btn-green mt-6"><Plus className="h-4 w-4" /> Create first event</button></div>;
  return <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{events.map((event) => { const editable = role === "SADU" || ["draft", "needs_changes"].includes(event.status); return <article key={event.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><EventStatus status={event.status} />{editable && <button type="button" onClick={() => onEdit(event)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={`Edit ${event.title}`}><Pencil className="h-4 w-4" /></button>}</div><h2 className="mt-5 text-lg font-black text-ink">{event.title}</h2><p className="mt-2 text-xs font-bold uppercase tracking-wide text-feu-teal">{event.organizer_name} · {event.category}</p><p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{event.description || "No description provided."}</p>{event.review_notes && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>SADU note:</strong> {event.review_notes}</p>}<div className="mt-auto space-y-1 pt-6 text-sm text-slate-600"><p className="font-semibold">{new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.starts_at))}</p><p className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5" />{event.venue || "Venue to be announced"}</p></div><div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">{role === "SCC Executive" && ["draft", "needs_changes"].includes(event.status) && <button type="button" onClick={() => onSubmit(event)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-feu-green px-3 py-2.5 text-xs font-bold text-white"><Send className="h-3.5 w-3.5" /> Submit to SADU</button>}{role === "SADU" && event.status === "submitted" && <><button type="button" onClick={() => { const notes = window.prompt("What must the organization change?"); if (notes) onStatusChange(event, "needs_changes", notes); }} className="rounded-xl border border-amber-300 px-3 py-2.5 text-xs font-bold text-amber-800">Needs changes</button><button type="button" onClick={() => onStatusChange(event, "approved", null)} className="flex-1 rounded-xl bg-feu-green px-3 py-2.5 text-xs font-bold text-white">Approve</button></>}{role === "SADU" && event.status === "approved" && <button type="button" onClick={() => onStatusChange(event, "published")} className="flex-1 rounded-xl bg-gold-default px-3 py-2.5 text-xs font-bold text-feu-moss">Publish</button>}{role === "SADU" && event.status === "published" && <button type="button" onClick={() => onStatusChange(event, "completed")} className="flex-1 rounded-xl bg-feu-green px-3 py-2.5 text-xs font-bold text-white">Mark completed</button>}{role === "SADU" && !["completed", "cancelled"].includes(event.status) && <button type="button" onClick={() => onStatusChange(event, "cancelled")} className="rounded-xl border border-red-200 px-3 py-2.5 text-xs font-bold text-red-700">Cancel</button>}{editable && <button type="button" onClick={() => onEdit(event)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600">Edit</button>}</div></article>; })}</div>;
}

function NotificationCenter({ notifications, onOpen }: { notifications: Notification[]; onOpen: (notification: Notification) => void }) {
  if (!notifications.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center"><Bell className="mx-auto h-10 w-10 text-feu-green" /><h2 className="mt-4 font-black text-ink">You’re all caught up</h2><p className="mt-2 text-sm text-slate-500">Approval updates will appear here.</p></div>;
  return <div className="space-y-3">{notifications.map((notification) => <button key={notification.id} type="button" onClick={() => void onOpen(notification)} className={`group block w-full rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-feu-green/40 hover:shadow-md ${notification.read_at ? "border-slate-200 bg-white" : "border-gold-default/40 bg-gold-default/10"}`}><div className="flex items-start justify-between gap-4"><div><h2 className="font-black text-ink">{notification.title}</h2><p className="mt-1 text-sm text-slate-600">{notification.message}</p></div>{!notification.read_at && <span className="rounded-full bg-gold-default px-2 py-1 text-[0.6rem] font-black uppercase text-feu-moss">New</span>}</div><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-slate-400">{new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.created_at))}</p><span className="text-xs font-bold text-feu-green group-hover:underline">View event details →</span></div></button>)}</div>;
}

function EventDetailsDialog({ event, onClose, onOpenActions }: { event: ManagedEvent; onClose: () => void; onOpenActions: () => void }) {
  const schedule = new Intl.DateTimeFormat("en-PH", { dateStyle: "full", timeStyle: "short" });
  return <Dialog title={event.title} subtitle={`${event.organizer_name} · ${event.category}`} onClose={onClose}><div className="space-y-6 p-6">
    <div className="flex flex-wrap items-center gap-3"><EventStatus status={event.status} /><span className="text-xs font-semibold text-slate-500">Database event ID: {event.id.slice(0, 8)}</span></div>
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"><div><p className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400">Starts</p><p className="mt-1 text-sm font-semibold text-ink">{schedule.format(new Date(event.starts_at))}</p></div><div><p className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400">Ends</p><p className="mt-1 text-sm font-semibold text-ink">{schedule.format(new Date(event.ends_at))}</p></div><div><p className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400">Venue</p><p className="mt-1 text-sm font-semibold text-ink">{event.venue || "To be announced"}</p></div><div><p className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400">Capacity</p><p className="mt-1 text-sm font-semibold text-ink">{event.capacity ? `${event.capacity} participants` : "Not specified"}</p></div></div>
    <div><h3 className="text-sm font-black uppercase tracking-wider text-feu-teal">Event description</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{event.description || "No description was provided."}</p></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-black uppercase text-slate-400">Contact person</p><p className="mt-1 text-sm text-slate-700">{event.contact_name || "Not specified"}{event.contact_email ? ` · ${event.contact_email}` : ""}</p></div><div><p className="text-xs font-black uppercase text-slate-400">Registration</p>{event.registration_url ? <a href={event.registration_url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm font-bold text-feu-green hover:underline">{event.registration_url}</a> : <p className="mt-1 text-sm text-slate-500">No registration link</p>}</div></div>
    {event.review_notes && <div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>SADU review notes:</strong> {event.review_notes}</div>}
    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500">Close</button><button type="button" onClick={onOpenActions} className="btn-green">Open event review actions</button></div>
  </div></Dialog>;
}
function ConflictDialog({ review, onClose, onContinue }: { review: { event: ManagedEvent; conflicts: Conflict[] }; onClose: () => void; onContinue: () => void }) { return <Dialog title="Schedule conflicts found" subtitle="Review these overlaps before submitting to SADU." onClose={onClose}><div className="space-y-4 p-6"><div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="h-5 w-5 shrink-0" /><p>{review.conflicts.length} overlapping event{review.conflicts.length === 1 ? "" : "s"} found. Venue conflicts need special attention.</p></div>{review.conflicts.map((conflict) => <div key={conflict.event_id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex justify-between gap-3"><p className="font-bold text-ink">{conflict.event_title}</p><span className={`rounded-full px-2 py-1 text-[0.6rem] font-black uppercase ${conflict.conflict_type === "venue" ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-700"}`}>{conflict.conflict_type} conflict</span></div><p className="mt-2 text-xs text-slate-500">{new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(conflict.event_starts_at))} · {conflict.event_venue || "No venue"}</p></div>)}<div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-500">Go back and edit</button><button type="button" onClick={onContinue} className="btn-green">Submit anyway</button></div></div></Dialog>; }
function EventStatus({ status }: { status: EventStatus }) { const styles: Record<EventStatus, string> = { draft: "bg-slate-100 text-slate-600", submitted: "bg-sky-100 text-sky-700", needs_changes: "bg-amber-100 text-amber-800", approved: "bg-teal-100 text-teal-800", published: "bg-emerald-100 text-emerald-800", completed: "bg-violet-100 text-violet-700", cancelled: "bg-red-100 text-red-700" }; return <span className={`rounded-full px-3 py-1 text-[0.65rem] font-black uppercase tracking-wide ${styles[status]}`}>{status.replace("_", " ")}</span>; }
function Dialog({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-[60] flex items-end justify-end bg-ink/45 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-label={title}><div className="max-h-[96vh] w-full overflow-y-auto rounded-t-3xl bg-cloud shadow-2xl sm:max-w-2xl sm:rounded-3xl"><div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5"><div><h2 className="text-xl font-black text-ink">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div>{children}</div></div>; }

function TaskForm({ onClose, onSave }: { onClose: () => void; onSave: (values: { title: string; description: string; status: TaskStatus; priority: TaskPriority; due_at: string | null }) => Promise<void> }) {
  const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setError(null); const data = new FormData(event.currentTarget); try { await onSave({ title: String(data.get("title")), description: String(data.get("description")), status: String(data.get("status")) as TaskStatus, priority: String(data.get("priority")) as TaskPriority, due_at: data.get("due_at") ? new Date(String(data.get("due_at"))).toISOString() : null }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create task."); setSaving(false); } }
  return <Dialog title="Create task" subtitle="Add work to the SCC project board." onClose={onClose}><form onSubmit={submit} className="space-y-5 p-6"><Field label="Task title"><input name="title" required minLength={3} maxLength={200} className={inputClass} placeholder="e.g. Finalize venue permit" /></Field><Field label="Description"><textarea name="description" rows={4} className={inputClass} placeholder="Add acceptance criteria or important context…" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Starting stage"><select name="status" defaultValue="todo" className={inputClass}><option value="backlog">Backlog</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done">Done</option></select></Field><Field label="Priority"><select name="priority" defaultValue="medium" className={inputClass}><option value="lowest">Lowest</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="highest">Highest</option></select></Field></div><Field label="Due date"><input name="due_at" type="date" className={inputClass} /></Field>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500">Cancel</button><button type="submit" disabled={saving} className="btn-green disabled:opacity-60">{saving ? "Creating…" : "Create task"}</button></div></form></Dialog>;
}

function EventForm({ event, organizations, onClose, onSave }: { event: ManagedEvent | null; organizations: Organization[]; onClose: () => void; onSave: (values: EventValues, poster: File | null, documents: File[]) => Promise<void> }) {
  const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit(formEvent: FormEvent<HTMLFormElement>) { formEvent.preventDefault(); setSaving(true); setError(null); const data = new FormData(formEvent.currentTarget); const startsAt = new Date(String(data.get("starts_at"))); const endsAt = new Date(String(data.get("ends_at"))); if (endsAt <= startsAt) { setError("End time must be after the start time."); setSaving(false); return; } try { await onSave({ title: String(data.get("title")), description: String(data.get("description")), organizer_name: "", organization_id: String(data.get("organization_id")), venue: String(data.get("venue")) || null, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(), is_public: data.get("is_public") === "on", registration_url: String(data.get("registration_url")) || null, category: String(data.get("category")), contact_name: String(data.get("contact_name")) || null, contact_email: String(data.get("contact_email")) || null, capacity: data.get("capacity") ? Number(data.get("capacity")) : null, review_notes: event?.review_notes ?? null }, data.get("poster") instanceof File ? data.get("poster") as File : null, data.getAll("documents").filter((item): item is File => item instanceof File)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save event."); setSaving(false); } }
  return <Dialog title={event ? "Edit event" : "Create event draft"} subtitle="Add details and supporting documents before SADU review." onClose={onClose}><form onSubmit={submit} className="space-y-5 p-6"><Field label="Event title"><input name="title" required minLength={3} maxLength={160} defaultValue={event?.title} className={inputClass} placeholder="e.g. RSO Leadership Summit" /></Field><Field label="Recognized organization"><select name="organization_id" required defaultValue={event?.organization_id ?? organizations[0]?.id} className={inputClass}>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.acronym} — {organization.name}</option>)}</select></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Category"><select name="category" defaultValue={event?.category ?? "organization"} className={inputClass}>{["academic", "advocacy", "arts", "community", "organization", "sports", "wellness", "other"].map((category) => <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}</select></Field><Field label="Capacity"><input name="capacity" type="number" min="1" defaultValue={event?.capacity ?? ""} className={inputClass} placeholder="Optional" /></Field></div><Field label="Description"><textarea name="description" rows={4} defaultValue={event?.description} className={inputClass} placeholder="Tell students what the event is about…" /></Field><Field label="Venue"><input name="venue" defaultValue={event?.venue ?? ""} className={inputClass} placeholder="Room, building, or online" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Starts"><input name="starts_at" required type="datetime-local" defaultValue={toLocalInput(event?.starts_at)} className={inputClass} /></Field><Field label="Ends"><input name="ends_at" required type="datetime-local" defaultValue={toLocalInput(event?.ends_at)} className={inputClass} /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Contact person"><input name="contact_name" defaultValue={event?.contact_name ?? ""} className={inputClass} /></Field><Field label="Contact email"><input name="contact_email" type="email" defaultValue={event?.contact_email ?? ""} className={inputClass} /></Field></div><Field label="Registration URL"><input name="registration_url" type="url" defaultValue={event?.registration_url ?? ""} className={inputClass} placeholder="https://…" /></Field><div className="grid gap-4 sm:grid-cols-2"><FileField label="Event poster" name="poster" accept="image/jpeg,image/png,image/webp" hint="JPG, PNG, or WebP up to 10 MB" /><FileField label="Approval documents" name="documents" accept="application/pdf,.docx" multiple hint="Permits, proposals, or budgets" /></div><label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"><input name="is_public" type="checkbox" defaultChecked={event?.is_public ?? true} className="mt-0.5 h-4 w-4 accent-feu-green" /><span><span className="block text-sm font-bold text-ink">Show after SADU publishes</span><span className="mt-1 block text-xs text-slate-500">Drafts and approved events remain private until Published.</span></span></label>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500">Cancel</button><button type="submit" disabled={saving} className="btn-green disabled:opacity-60">{saving ? "Saving…" : event ? "Save changes" : "Create draft"}</button></div></form></Dialog>;
}

function FileField({ label, name, accept, multiple, hint }: { label: string; name: string; accept: string; multiple?: boolean; hint: string }) { return <label className="block text-sm font-bold text-ink"><span>{label}</span><span className="mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-slate-500 hover:border-feu-green"><Upload className="h-5 w-5 text-feu-green" /><span className="mt-2 text-xs">{hint}</span><input name={name} type="file" accept={accept} multiple={multiple} className="mt-2 block w-full text-xs" /></span></label>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-bold text-ink">{label}{children}</label>; }
function toLocalInput(value?: string) { if (!value) return ""; const date = new Date(value); const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return local.toISOString().slice(0, 16); }
