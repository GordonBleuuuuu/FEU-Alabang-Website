"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "lowest" | "low" | "medium" | "high" | "highest";

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
};

export default function AdminBoard({ tasks, onTasksChange, onError }: AdminBoardProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const groupedTasks = useMemo(
    () => Object.fromEntries(
      columns.map(({ status }) => [status, tasks.filter((task) => task.status === status)]),
    ) as Record<TaskStatus, BoardTask[]>,
    [tasks],
  );

  async function moveTask(task: BoardTask, direction: -1 | 1) {
    const currentIndex = columns.findIndex(({ status }) => status === task.status);
    const nextStatus = columns[currentIndex + direction]?.status;
    if (!nextStatus) return;

    setUpdatingId(task.id);
    const previousTasks = tasks;
    onTasksChange(tasks.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));

    const supabase = createClient();
    const { error } = await supabase.from("tasks").update({ status: nextStatus }).eq("id", task.id);
    if (error) {
      onTasksChange(previousTasks);
      onError(error.message);
    }
    setUpdatingId(null);
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="grid min-w-[76rem] grid-cols-5 gap-4">
        {columns.map((column, columnIndex) => (
          <section
            key={column.status}
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
                <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-feu-teal">SCC-{task.task_key}</span>
                    <span className={`rounded-full px-2 py-1 text-[0.65rem] font-bold uppercase ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold leading-5 text-ink">{task.title}</h3>
                  {task.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{task.description}</p>}
                  {task.due_at && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(task.due_at))}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-feu-green/10 text-feu-green" title={task.assignee_id ?? "Unassigned"}>
                      <UserRound className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={columnIndex === 0 || updatingId === task.id}
                        onClick={() => void moveTask(task, -1)}
                        aria-label={`Move ${task.title} left`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={columnIndex === columns.length - 1 || updatingId === task.id}
                        onClick={() => void moveTask(task, 1)}
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
  );
}
