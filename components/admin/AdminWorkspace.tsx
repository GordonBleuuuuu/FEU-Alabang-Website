"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Pencil,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import AdminBoard, {
  type BoardTask,
  type TaskPriority,
  type TaskStatus,
} from "./AdminBoard";
import { createClient } from "@/lib/supabase/client";

export type ManagedEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  organizer_name: string;
  venue: string | null;
  starts_at: string;
  ends_at: string;
  status: "draft" | "published" | "cancelled";
  is_public: boolean;
  registration_url: string | null;
  image_url: string | null;
};

type View = "overview" | "board" | "events";

const tabs: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "board", label: "Project board", icon: ClipboardList },
  { id: "events", label: "Events calendar", icon: CalendarDays },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-feu-green focus:ring-2 focus:ring-feu-green/15";

export default function AdminWorkspace({
  initialTasks,
  initialEvents,
}: {
  initialTasks: BoardTask[];
  initialEvents: ManagedEvent[];
}) {
  const [view, setView] = useState<View>("overview");
  const [tasks, setTasks] = useState(initialTasks);
  const [events, setEvents] = useState(initialEvents);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ManagedEvent | "new" | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const metrics = useMemo(() => ({
    openTasks: tasks.filter((task) => task.status !== "done").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    publishedEvents: events.filter((event) => event.status === "published").length,
    draftEvents: events.filter((event) => event.status === "draft").length,
  }), [events, tasks]);

  function showNotice(kind: "success" | "error", text: string) {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 4500);
  }

  async function createTask(values: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_at: string | null;
  }) {
    const supabase = createClient();
    const position = tasks.filter((task) => task.status === values.status).length;
    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...values, position })
      .select("id,task_key,title,description,status,priority,assignee_id,due_at,position")
      .single();

    if (error) throw error;
    setTasks((current) => [...current, data as BoardTask]);
    setShowTaskForm(false);
    setView("board");
    showNotice("success", `Task SCC-${data.task_key} created.`);
  }

  async function saveEvent(values: Omit<ManagedEvent, "id" | "slug">) {
    const supabase = createClient();

    if (editingEvent && editingEvent !== "new") {
      const { data, error } = await supabase
        .from("events")
        .update(values)
        .eq("id", editingEvent.id)
        .select("id,title,slug,description,organizer_name,venue,starts_at,ends_at,status,is_public,registration_url,image_url")
        .single();
      if (error) throw error;
      setEvents((current) => current.map((event) => event.id === data.id ? data as ManagedEvent : event));
      showNotice("success", "Event updated.");
    } else {
      const baseSlug = values.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const slug = `${baseSlug || "event"}-${crypto.randomUUID().slice(0, 8)}`;
      const { data, error } = await supabase
        .from("events")
        .insert({ ...values, slug })
        .select("id,title,slug,description,organizer_name,venue,starts_at,ends_at,status,is_public,registration_url,image_url")
        .single();
      if (error) throw error;
      setEvents((current) => [...current, data as ManagedEvent].sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
      showNotice("success", values.status === "published" ? "Event created and published." : "Event draft created.");
    }

    setEditingEvent(null);
    setView("events");
  }

  async function changeEventStatus(event: ManagedEvent, status: ManagedEvent["status"]) {
    const supabase = createClient();
    const { error } = await supabase.from("events").update({ status }).eq("id", event.id);
    if (error) {
      showNotice("error", error.message);
      return;
    }
    setEvents((current) => current.map((item) => item.id === event.id ? { ...item, status } : item));
    showNotice("success", status === "published" ? "Event published to the public calendar." : "Event moved to drafts.");
  }

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  view === tab.id ? "bg-feu-moss text-white" : "text-slate-500 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => setShowTaskForm(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-feu-green/25 px-4 py-2.5 text-sm font-bold text-feu-green transition hover:bg-feu-green/5 sm:flex-none">
            <Plus className="h-4 w-4" /> New task
          </button>
          <button type="button" onClick={() => setEditingEvent("new")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-feu-moss shadow-gold transition hover:-translate-y-0.5 sm:flex-none">
            <Plus className="h-4 w-4" /> New event
          </button>
        </div>
      </div>

      {notice && (
        <div role="status" className={`fixed right-5 top-5 z-[70] max-w-sm rounded-2xl px-5 py-4 text-sm font-semibold shadow-xl ${notice.kind === "success" ? "bg-feu-moss text-white" : "bg-red-600 text-white"}`}>
          {notice.text}
        </div>
      )}

      {view === "overview" && (
        <Overview metrics={metrics} tasks={tasks} events={events} onOpenBoard={() => setView("board")} onOpenEvents={() => setView("events")} />
      )}

      {view === "board" && (
        <AdminBoard tasks={tasks} onTasksChange={setTasks} onError={(message) => showNotice("error", message)} />
      )}

      {view === "events" && (
        <EventManager events={events} onEdit={setEditingEvent} onStatusChange={changeEventStatus} onCreate={() => setEditingEvent("new")} />
      )}

      {showTaskForm && (
        <TaskForm onClose={() => setShowTaskForm(false)} onSave={createTask} />
      )}

      {editingEvent && (
        <EventForm event={editingEvent === "new" ? null : editingEvent} onClose={() => setEditingEvent(null)} onSave={saveEvent} />
      )}
    </div>
  );
}

function Overview({
  metrics,
  tasks,
  events,
  onOpenBoard,
  onOpenEvents,
}: {
  metrics: { openTasks: number; inProgress: number; publishedEvents: number; draftEvents: number };
  tasks: BoardTask[];
  events: ManagedEvent[];
  onOpenBoard: () => void;
  onOpenEvents: () => void;
}) {
  const cards = [
    { label: "Open tasks", value: metrics.openTasks, icon: ClipboardList, color: "bg-feu-green/10 text-feu-green" },
    { label: "In progress", value: metrics.inProgress, icon: Sparkles, color: "bg-sky-100 text-sky-700" },
    { label: "Published events", value: metrics.publishedEvents, icon: CheckCircle2, color: "bg-gold/20 text-feu-moss" },
    { label: "Event drafts", value: metrics.draftEvents, icon: CalendarDays, color: "bg-slate-100 text-slate-600" },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${card.color}`}><Icon className="h-5 w-5" /></div>
              <p className="mt-5 text-3xl font-black text-ink">{card.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{card.label}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <OverviewPanel title="Project activity" empty={tasks.length === 0} emptyText="Create your first task to start tracking council work." action="Open project board" onAction={onOpenBoard}>
          {tasks.slice(0, 4).map((task) => (
            <div key={task.id} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
              <div><p className="text-sm font-bold text-ink">{task.title}</p><p className="mt-1 text-xs text-slate-500">SCC-{task.task_key} · {task.status.replace("_", " ")}</p></div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-bold uppercase text-slate-600">{task.priority}</span>
            </div>
          ))}
        </OverviewPanel>

        <OverviewPanel title="Event pipeline" empty={events.length === 0} emptyText="Create an event draft or publish one to the student calendar." action="Manage events" onAction={onOpenEvents}>
          {events.slice(0, 4).map((event) => (
            <div key={event.id} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
              <div><p className="text-sm font-bold text-ink">{event.title}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(event.starts_at))}</p></div>
              <EventStatus status={event.status} />
            </div>
          ))}
        </OverviewPanel>
      </div>
    </div>
  );
}

function OverviewPanel({ title, empty, emptyText, action, onAction, children }: { title: string; empty: boolean; emptyText: string; action: string; onAction: () => void; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="font-black text-ink">{title}</h2><button type="button" onClick={onAction} className="text-xs font-bold text-feu-green hover:underline">{action}</button></div>
      {empty ? <p className="mt-8 rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">{emptyText}</p> : <div className="mt-4">{children}</div>}
    </section>
  );
}

function EventManager({ events, onEdit, onStatusChange, onCreate }: { events: ManagedEvent[]; onEdit: (event: ManagedEvent) => void; onStatusChange: (event: ManagedEvent, status: ManagedEvent["status"]) => void; onCreate: () => void }) {
  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-feu-green/25 bg-white px-6 py-20 text-center">
        <CalendarDays className="mx-auto h-12 w-12 text-feu-green" />
        <h2 className="mt-5 text-xl font-black text-ink">No events yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Create an RSO event, save it as a draft, or publish it directly to the public calendar.</p>
        <button type="button" onClick={onCreate} className="btn-green mt-6"><Plus className="h-4 w-4" /> Create first event</button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <article key={event.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4"><EventStatus status={event.status} /><button type="button" onClick={() => onEdit(event)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={`Edit ${event.title}`}><Pencil className="h-4 w-4" /></button></div>
          <h2 className="mt-5 text-lg font-black text-ink">{event.title}</h2>
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-feu-teal">{event.organizer_name}</p>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{event.description || "No description provided."}</p>
          <div className="mt-auto pt-6 text-sm text-slate-600">
            <p className="font-semibold">{new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.starts_at))}</p>
            <p className="mt-1 text-xs text-slate-400">{event.venue || "Venue to be announced"}</p>
          </div>
          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
            {event.status !== "published" ? (
              <button type="button" onClick={() => void onStatusChange(event, "published")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-feu-green px-3 py-2.5 text-xs font-bold text-white"><Send className="h-3.5 w-3.5" /> Publish</button>
            ) : (
              <button type="button" onClick={() => void onStatusChange(event, "draft")} className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600">Move to draft</button>
            )}
            <button type="button" onClick={() => onEdit(event)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600">Edit</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function EventStatus({ status }: { status: ManagedEvent["status"] }) {
  const styles = { draft: "bg-slate-100 text-slate-600", published: "bg-emerald-100 text-emerald-800", cancelled: "bg-red-100 text-red-700" };
  return <span className={`rounded-full px-3 py-1 text-[0.65rem] font-black uppercase tracking-wide ${styles[status]}`}>{status}</span>;
}

function Dialog({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end bg-ink/45 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[96vh] w-full overflow-y-auto rounded-t-3xl bg-cloud shadow-2xl sm:max-w-xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div><h2 className="text-xl font-black text-ink">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TaskForm({ onClose, onSave }: { onClose: () => void; onSave: (values: { title: string; description: string; status: TaskStatus; priority: TaskPriority; due_at: string | null }) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      await onSave({
        title: String(data.get("title")),
        description: String(data.get("description")),
        status: String(data.get("status")) as TaskStatus,
        priority: String(data.get("priority")) as TaskPriority,
        due_at: data.get("due_at") ? new Date(String(data.get("due_at"))).toISOString() : null,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create task.");
      setSaving(false);
    }
  }

  return (
    <Dialog title="Create task" subtitle="Add work to the SCC project board." onClose={onClose}>
      <form onSubmit={submit} className="space-y-5 p-6">
        <Field label="Task title"><input name="title" required minLength={3} maxLength={200} className={inputClass} placeholder="e.g. Finalize venue permit" /></Field>
        <Field label="Description"><textarea name="description" rows={4} className={inputClass} placeholder="Add acceptance criteria or important context…" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starting stage"><select name="status" defaultValue="todo" className={inputClass}><option value="backlog">Backlog</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done">Done</option></select></Field>
          <Field label="Priority"><select name="priority" defaultValue="medium" className={inputClass}><option value="lowest">Lowest</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="highest">Highest</option></select></Field>
        </div>
        <Field label="Due date"><input name="due_at" type="date" className={inputClass} /></Field>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500">Cancel</button><button type="submit" disabled={saving} className="btn-green disabled:opacity-60">{saving ? "Creating…" : "Create task"}</button></div>
      </form>
    </Dialog>
  );
}

function EventForm({ event, onClose, onSave }: { event: ManagedEvent | null; onClose: () => void; onSave: (values: Omit<ManagedEvent, "id" | "slug">) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSaving(true);
    setError(null);
    const data = new FormData(formEvent.currentTarget);
    const startsAt = new Date(String(data.get("starts_at")));
    const endsAt = new Date(String(data.get("ends_at")));
    if (endsAt <= startsAt) {
      setError("End time must be after the start time.");
      setSaving(false);
      return;
    }
    try {
      await onSave({
        title: String(data.get("title")),
        description: String(data.get("description")),
        organizer_name: String(data.get("organizer_name")),
        venue: String(data.get("venue")) || null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: String(data.get("status")) as ManagedEvent["status"],
        is_public: data.get("is_public") === "on",
        registration_url: String(data.get("registration_url")) || null,
        image_url: String(data.get("image_url")) || null,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save event.");
      setSaving(false);
    }
  }

  return (
    <Dialog title={event ? "Edit event" : "Create event"} subtitle="Manage what appears on the public RSO calendar." onClose={onClose}>
      <form onSubmit={submit} className="space-y-5 p-6">
        <Field label="Event title"><input name="title" required minLength={3} maxLength={160} defaultValue={event?.title} className={inputClass} placeholder="e.g. RSO Leadership Summit" /></Field>
        <Field label="Organizer"><input name="organizer_name" required defaultValue={event?.organizer_name} className={inputClass} placeholder="Recognized student organization" /></Field>
        <Field label="Description"><textarea name="description" rows={4} defaultValue={event?.description} className={inputClass} placeholder="Tell students what the event is about…" /></Field>
        <Field label="Venue"><input name="venue" defaultValue={event?.venue ?? ""} className={inputClass} placeholder="Room, building, or online" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts"><input name="starts_at" required type="datetime-local" defaultValue={toLocalInput(event?.starts_at)} className={inputClass} /></Field>
          <Field label="Ends"><input name="ends_at" required type="datetime-local" defaultValue={toLocalInput(event?.ends_at)} className={inputClass} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status"><select name="status" defaultValue={event?.status ?? "draft"} className={inputClass}><option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option></select></Field>
          <Field label="Registration URL"><input name="registration_url" type="url" defaultValue={event?.registration_url ?? ""} className={inputClass} placeholder="https://…" /></Field>
        </div>
        <Field label="Event image URL"><input name="image_url" type="url" defaultValue={event?.image_url ?? ""} className={inputClass} placeholder="https://…" /></Field>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"><input name="is_public" type="checkbox" defaultChecked={event?.is_public ?? true} className="mt-0.5 h-4 w-4 accent-feu-green" /><span><span className="block text-sm font-bold text-ink">Show on public calendar</span><span className="mt-1 block text-xs text-slate-500">The event must also be Published before students can see it.</span></span></label>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500">Cancel</button><button type="submit" disabled={saving} className="btn-green disabled:opacity-60">{saving ? "Saving…" : event ? "Save changes" : "Create event"}</button></div>
      </form>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-bold text-ink">{label}{children}</label>;
}

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
