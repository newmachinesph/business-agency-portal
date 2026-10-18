"use client";

import { useState } from "react";
import { Columns3, List, MessageSquare, Paperclip, Play, Plus, Timer } from "lucide-react";
import { useStore, STATUSES, PRIORITY_COLOR, minutesOnTask } from "@/lib/store";
import { hm, due } from "@/lib/format";
import { Avatar, Chip, Empty } from "@/components/ui";
import { TaskDetail } from "@/components/TaskDetail";
import type { Id, Task, TaskStatus } from "@/lib/types";

export default function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const projects = useStore((s) => s.projects);
  const users = useStore((s) => s.users);
  const entries = useStore((s) => s.entries);
  const moveTask = useStore((s) => s.moveTask);
  const addTask = useStore((s) => s.addTask);
  const startTimer = useStore((s) => s.startTimer);

  const [view, setView] = useState<"board" | "list">("board");
  const [projectFilter, setProjectFilter] = useState<Id | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<Id | "all">("all");
  const [openTask, setOpenTask] = useState<Id | null>(null);
  const [dragging, setDragging] = useState<Id | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [composerStatus, setComposerStatus] = useState<TaskStatus | null>(null);

  const visible = tasks.filter(
    (t) =>
      (projectFilter === "all" || t.projectId === projectFilter) &&
      (assigneeFilter === "all" || t.assigneeId === assigneeFilter),
  );

  function submitNew(status: TaskStatus) {
    const title = newTitle.trim();
    if (!title) return setComposerStatus(null);
    const projectId = projectFilter === "all" ? projects[0].id : projectFilter;
    addTask({ title, projectId, status });
    setNewTitle("");
  }

  const Card = ({ task }: { task: Task }) => {
    const project = projects.find((p) => p.id === task.projectId)!;
    const d = due(task.dueDate);
    const tracked = minutesOnTask(entries, task.id);
    const doneSubs = task.subtasks.filter((s) => s.done).length;
    return (
      <article
        draggable
        onDragStart={() => setDragging(task.id)}
        onDragEnd={() => {
          setDragging(null);
          setDropTarget(null);
        }}
        onClick={() => setOpenTask(task.id)}
        className={`group cursor-pointer rounded-xl border border-line bg-surface p-3 transition hover:border-brand/40 hover:shadow-[0_8px_20px_-12px_rgba(14,17,22,0.3)] ${
          dragging === task.id ? "opacity-40" : ""
        }`}
      >
        <div className="mb-2 flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: PRIORITY_COLOR[task.priority] }}
          />
          <span className="font-mono text-[10px] text-ink-faint">{task.key}</span>
          <span className="ml-auto h-1.5 w-6 rounded-full" style={{ background: project.color }} />
        </div>
        <p className="text-sm leading-snug font-medium text-ink">{task.title}</p>
        {task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.map((t) => (
              <Chip key={t}>#{t}</Chip>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2.5 text-[11px] text-ink-faint">
          <Avatar user={users.find((u) => u.id === task.assigneeId)} size={22} />
          {d && (
            <span
              className={`font-medium ${
                d.tone === "late" ? "text-red" : d.tone === "soon" ? "text-amber" : ""
              }`}
            >
              {d.label}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip size={11} />
              {doneSubs}/{task.subtasks.length}
            </span>
          )}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={11} />
              {task.comments.length}
            </span>
          )}
          {tracked > 0 && (
            <span className="flex items-center gap-1 tabular-nums">
              <Timer size={11} />
              {hm(tracked)}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              startTimer(task.id, task.title);
            }}
            title="Start timer"
            className="ml-auto rounded-md p-1 opacity-0 transition group-hover:opacity-100 hover:bg-mint/15 hover:text-mint"
          >
            <Play size={12} />
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-6 py-3">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Tasks</h1>

        <div className="flex rounded-[10px] bg-canvas p-0.5">
          {(["board", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition ${
                view === v ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink"
              }`}
            >
              {v === "board" ? <Columns3 size={13} /> : <List size={13} />}
              {v}
            </button>
          ))}
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-[10px] border border-line bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-brand"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-[10px] border border-line bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-brand"
        >
          <option value="all">Everyone</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-ink-faint">
          {visible.length} task{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      {view === "board" ? (
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex h-full gap-4">
            {STATUSES.map((col) => {
              const items = visible.filter((t) => t.status === col.id);
              return (
                <section
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropTarget(col.id);
                  }}
                  onDragLeave={() => setDropTarget((s) => (s === col.id ? null : s))}
                  onDrop={() => {
                    if (dragging) moveTask(dragging, col.id);
                    setDragging(null);
                    setDropTarget(null);
                  }}
                  className={`flex h-full w-[290px] shrink-0 flex-col rounded-card border p-2.5 transition ${
                    dropTarget === col.id
                      ? "border-brand bg-brand-soft/60"
                      : "border-line bg-line-soft/50"
                  }`}
                >
                  <header className="mb-2.5 flex items-center gap-2 px-1">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: col.color }}
                    />
                    <h2 className="text-xs font-semibold tracking-wide text-ink uppercase">
                      {col.label}
                    </h2>
                    <span className="text-xs text-ink-faint">{items.length}</span>
                    <button
                      onClick={() => {
                        setComposerStatus(col.id);
                        setNewTitle("");
                      }}
                      className="ml-auto rounded-md p-1 text-ink-faint transition hover:bg-surface hover:text-brand"
                    >
                      <Plus size={14} />
                    </button>
                  </header>

                  <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
                    {composerStatus === col.id && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitNew(col.id);
                        }}
                      >
                        <input
                          autoFocus
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => submitNew(col.id)}
                          placeholder="Task name…"
                          className="w-full rounded-xl border border-brand bg-surface p-3 text-sm outline-none"
                        />
                      </form>
                    )}
                    {items.map((t) => (
                      <Card key={t.id} task={t} />
                    ))}
                    {!items.length && composerStatus !== col.id && (
                      <p className="rounded-xl border border-dashed border-line py-6 text-center text-xs text-ink-faint">
                        Drop tasks here
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {!visible.length ? (
            <Empty>No tasks match these filters.</Empty>
          ) : (
            <div className="overflow-hidden rounded-card border border-line bg-surface">
              <table className="w-full text-sm">
                <thead className="border-b border-line bg-canvas text-left text-[11px] tracking-wide text-ink-faint uppercase">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Task</th>
                    <th className="px-4 py-2.5 font-semibold">Project</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold">Assignee</th>
                    <th className="px-4 py-2.5 font-semibold">Due</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Tracked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {visible.map((t) => {
                    const project = projects.find((p) => p.id === t.projectId)!;
                    const status = STATUSES.find((s) => s.id === t.status)!;
                    const d = due(t.dueDate);
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setOpenTask(t.id)}
                        className="cursor-pointer transition hover:bg-canvas"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: PRIORITY_COLOR[t.priority] }}
                            />
                            <span className="font-medium text-ink">{t.title}</span>
                            <span className="font-mono text-[10px] text-ink-faint">{t.key}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <Chip color={project.color}>{project.name}</Chip>
                        </td>
                        <td className="px-4 py-2.5">
                          <select
                            value={t.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => moveTask(t.id, e.target.value as TaskStatus)}
                            className="rounded-md border border-line bg-surface px-1.5 py-1 text-xs outline-none focus:border-brand"
                            style={{ color: status.color }}
                          >
                            {STATUSES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          <Avatar user={users.find((u) => u.id === t.assigneeId)} size={24} />
                        </td>
                        <td
                          className={`px-4 py-2.5 text-xs font-medium ${
                            d?.tone === "late"
                              ? "text-red"
                              : d?.tone === "soon"
                                ? "text-amber"
                                : "text-ink-faint"
                          }`}
                        >
                          {d?.label ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs tabular-nums text-ink-soft">
                          {hm(minutesOnTask(entries, t.id))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <TaskDetail taskId={openTask} onClose={() => setOpenTask(null)} />
    </div>
  );
}
