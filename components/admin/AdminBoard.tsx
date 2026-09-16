"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, Search, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "lowest" | "low" | "medium" | "high" | "highest";
export type TaskLabel = { id: string; name: string; color: string };

export type BoardTask = {
  id: string;
  task_key: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_at: string | null;
  position: number;
  event_id: string | null;
  labels: TaskLabel[];
};

const columns: { status: TaskStatus; title: string }[] = [
  { status: "backlog", title: "Backlog" },
  { status: "todo", title: "To do" },
  { status: "in_progress", title: "In progress" },
  { status: "review", title: "Review" },
  { status: "done", title: "Done" },
];

const priorityStyles: Record<TaskPriority, string> = {
  lowest: "bg-slate-100 text-slate-500",
  low: "bg-sky-100 text-sky-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  highest: "bg-red-100 text-red-700",
};

type AdminBoardProps = {
  tasks: BoardTask[];
  onTasksChange: (tasks: BoardTask[]) => void;
  onError: (message: string) => void;
  onOpenTask: (task: BoardTask) => void;
  assignees: Array<{ id: string; name: string }>;
};

export default function AdminBoard({ tasks, onTasksChange, onError, onOpenTask, assignees }: AdminBoardProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");

  const availableLabels = useMemo(() => {
    const labels = new Map<string, TaskLabel>();
    tasks.forEach((task) => task.labels.forEach((label) => labels.set(label.id, label)));
    return [...labels.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [tasks]);
  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const searchable = `${task.task_key} ${task.title} ${task.description}`.toLowerCase();
    return (!search || searchable.includes(search.toLowerCase()))
      && (priorityFilter === "all" || task.priority === priorityFilter)
      && (assigneeFilter === "all" || task.assignee_id === assigneeFilter)
      && (labelFilter === "all" || task.labels.some((label) => label.id === labelFilter));
  }), [tasks, search, priorityFilter, assigneeFilter, labelFilter]);

  const groupedTasks = useMemo(
    () => Object.fromEntries(
      columns.map(({ status }) => [status, filteredTasks.filter((task) => task.status === status)]),
    ) as Record<TaskStatus, BoardTask[]>,
    [filteredTasks],
  );

  async function moveTask(task: BoardTask, direction: -1 | 1) {
    const currentIndex = columns.findIndex(({ status }) => status === task.status);
    const nextStatus = columns[currentIndex + direction]?.status;
    if (!nextStatus) return;

    await moveTaskToStatus(task, nextStatus);
  }

  async function moveTaskToStatus(task: BoardTask, nextStatus: TaskStatus) {
    if (task.status === nextStatus) return;

    setUpdatingId(task.id);
    const previousTasks = tasks;
    const position = tasks.filter((item) => item.status === nextStatus).length;
    onTasksChange(tasks.map((item) => item.id === task.id ? { ...item, status: nextStatus, position } : item));

    const supabase = createClient();
    const { error } = await supabase.from("tasks").update({ status: nextStatus, position }).eq("id", task.id);
    if (error) {
      onTasksChange(previousTasks);
      onError(error.message);
    }
    setUpdatingId(null);
  }

  return (
    <div>
      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-feu-green" /></label>
        <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600"><option value="all">All designated people</option>{assignees.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select>
        <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600"><option value="all">All priorities</option>{Object.keys(priorityStyles).map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select>
        <select value={labelFilter} onChange={(event) => setLabelFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600"><option value="all">All labels</option>{availableLabels.map((label) => <option key={label.id} value={label.id}>{label.name}</option>)}</select>
      </div>
    <div className="overflow-x-auto pb-4">
      <div className="grid min-w-[76rem] grid-cols-5 gap-4">
        {columns.map((column, columnIndex) => (
          <section
            key={column.status}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              const task = tasks.find((item) => item.id === draggedTaskId);
              if (task) void moveTaskToStatus(task, column.status);
              setDraggedTaskId(null);
            }}
            className="min-h-[30rem] rounded-2xl border border-slate-200/80 bg-slate-100 p-3"
            aria-labelledby={`column-${column.status}`}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 id={`column-${column.status}`} className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">
                {column.title}
              </h2>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">
                {groupedTasks[column.status].length}
              </span>
            </div>

            <div className="space-y-3">
              {groupedTasks[column.status].length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-xs font-medium text-slate-400">
                  No tasks in this stage
                </div>
              )}

              {groupedTasks[column.status].map((task) => (
                <article
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedTaskId(task.id)}
                  onDragEnd={() => setDraggedTaskId(null)}
                  onClick={() => onOpenTask(task)}
                  className={`cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:cursor-grabbing ${draggedTaskId === task.id ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-feu-teal">SCC-{task.task_key}</span>
                    <span className={`rounded-full px-2 py-1 text-[0.65rem] font-bold uppercase ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold leading-5 text-ink">{task.title}</h3>
                  {task.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{task.description}</p>}
                  {task.labels.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{task.labels.map((label) => <span key={label.id} className="rounded-full px-2 py-1 text-[0.6rem] font-bold" style={{ backgroundColor: `${label.color}1A`, color: label.color }}>{label.name}</span>)}</div>}
                  {task.due_at && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(task.due_at))}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="inline-flex max-w-36 items-center gap-1.5 rounded-full bg-feu-green/10 px-2 py-1 text-xs font-semibold text-feu-green" title={assignees.find((person) => person.id === task.assignee_id)?.name ?? "Unassigned"}>
                      <UserRound className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{assignees.find((person) => person.id === task.assignee_id)?.name ?? "Unassigned"}</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={columnIndex === 0 || updatingId === task.id}
                        onClick={(event) => { event.stopPropagation(); void moveTask(task, -1); }}
                        aria-label={`Move ${task.title} left`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={columnIndex === columns.length - 1 || updatingId === task.id}
                        onClick={(event) => { event.stopPropagation(); void moveTask(task, 1); }}
                        aria-label={`Move ${task.title} right`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
    </div>
  );
}
