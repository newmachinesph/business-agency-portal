"use client";

import { useState } from "react";
import { Play, Plus, Trash2 } from "lucide-react";
import { useStore, STATUSES, PRIORITY_COLOR, minutesOnTask } from "@/lib/store";
import { hm, relTime, due } from "@/lib/format";
import { Avatar, Chip, Modal, Progress } from "@/components/ui";
import type { Id, Priority, TaskStatus } from "@/lib/types";

export function TaskDetail({ taskId, onClose }: { taskId: Id | null; onClose: () => void }) {
  const task = useStore((s) => s.tasks.find((t) => t.id === taskId));
  const users = useStore((s) => s.users);
  const projects = useStore((s) => s.projects);
  const entries = useStore((s) => s.entries);
  const timer = useStore((s) => s.timer);
  const {
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    addComment,
    startTimer,
  } = useStore.getState();

  const [comment, setComment] = useState("");
  const [subtask, setSubtask] = useState("");

  if (!task) return null;

  const project = projects.find((p) => p.id === task.projectId)!;
  const tracked = minutesOnTask(entries, task.id);
  const d = due(task.dueDate);
  const doneSubs = task.subtasks.filter((s) => s.done).length;
  const running = timer?.taskId === task.id;

  return (
    <Modal open onClose={onClose} width={760}>
      <div className="border-b border-line px-6 py-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Chip color={project.color} tone="soft">
            {project.name}
          </Chip>
          <span className="font-mono text-ink-faint">{task.key}</span>
          <span className="text-ink-faint">created {relTime(task.createdAt + "T09:00:00")}</span>
        </div>
        <input
          value={task.title}
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
          className="mt-2 w-full border-none bg-transparent pr-10 text-xl font-semibold tracking-tight text-ink outline-none"
        />
      </div>

      <div className="grid gap-6 px-6 py-5 md:grid-cols-[1fr_220px]">
        <div className="min-w-0 space-y-6">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Description
            </label>
            <textarea
              value={task.description}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              rows={3}
              placeholder="Add a description…"
              className="w-full resize-none rounded-[10px] border border-line bg-canvas p-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Subtasks
              </label>
              {task.subtasks.length > 0 && (
                <span className="text-[11px] text-ink-faint">
                  {doneSubs}/{task.subtasks.length}
                </span>
              )}
            </div>
            {task.subtasks.length > 0 && (
              <div className="mb-2">
                <Progress
                  value={(doneSubs / task.subtasks.length) * 100}
                  color={project.color}
                />
              </div>
            )}
            <ul className="space-y-1">
              {task.subtasks.map((s) => (
                <li key={s.id} className="flex items-center gap-2.5 rounded-lg px-1 py-1 hover:bg-canvas">
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={() => toggleSubtask(task.id, s.id)}
                    className="h-4 w-4 accent-[#7c5cff]"
                  />
                  <span
                    className={`text-sm ${s.done ? "text-ink-faint line-through" : "text-ink"}`}
                  >
                    {s.title}
                  </span>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!subtask.trim()) return;
                addSubtask(task.id, subtask.trim());
                setSubtask("");
              }}
              className="mt-2 flex items-center gap-2"
            >
              <Plus size={15} className="text-ink-faint" />
              <input
                value={subtask}
                onChange={(e) => setSubtask(e.target.value)}
                placeholder="Add subtask"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
              />
            </form>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Comments
            </label>
            <div className="space-y-3">
              {task.comments.map((c) => {
                const author = users.find((u) => u.id === c.authorId);
                return (
                  <div key={c.id} className="flex gap-2.5">
                    <Avatar user={author} size={28} />
                    <div className="min-w-0 rounded-[10px] rounded-tl-sm bg-canvas px-3 py-2">
                      <p className="text-[11px] text-ink-faint">
                        <span className="font-semibold text-ink">{author?.name}</span> ·{" "}
                        {relTime(c.at)}
                      </p>
                      <p className="text-sm text-ink-soft">{c.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!comment.trim()) return;
                addComment(task.id, comment.trim());
                setComment("");
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 rounded-[10px] border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                type="submit"
                className="rounded-[10px] bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-deep"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        <aside className="space-y-4 text-sm">
          <Field label="Status">
            <select
              value={task.status}
              onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
              className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand"
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Priority">
            <select
              value={task.priority}
              onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
              className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand"
              style={{ color: PRIORITY_COLOR[task.priority] }}
            >
              {(["urgent", "high", "normal", "low"] as Priority[]).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Assignee">
            <select
              value={task.assigneeId ?? ""}
              onChange={(e) => updateTask(task.id, { assigneeId: e.target.value || null })}
              className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Due date">
            <input
              type="date"
              value={task.dueDate ?? ""}
              onChange={(e) => updateTask(task.id, { dueDate: e.target.value || null })}
              className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand"
            />
            {d && (
              <p
                className={`mt-1 text-[11px] font-medium ${
                  d.tone === "late" ? "text-red" : d.tone === "soon" ? "text-amber" : "text-ink-faint"
                }`}
              >
                {d.label}
              </p>
            )}
          </Field>

          <Field label="Time">
            <div className="rounded-lg border border-line bg-canvas px-3 py-2">
              <p className="text-base font-semibold tabular-nums text-ink">{hm(tracked)}</p>
              <p className="text-[11px] text-ink-faint">
                {task.estimateMinutes ? `of ${hm(task.estimateMinutes)} estimated` : "no estimate"}
              </p>
              {task.estimateMinutes > 0 && (
                <div className="mt-2">
                  <Progress
                    value={(tracked / task.estimateMinutes) * 100}
                    color={tracked > task.estimateMinutes ? "#ef4444" : "#12b981"}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => startTimer(task.id, task.title)}
              disabled={running}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-mint px-3 py-2 text-xs font-semibold text-white transition hover:bg-mint/85 disabled:opacity-50"
            >
              <Play size={13} />
              {running ? "Timer running" : "Start timer"}
            </button>
          </Field>

          {task.tags.length > 0 && (
            <Field label="Tags">
              <div className="flex flex-wrap gap-1">
                {task.tags.map((t) => (
                  <Chip key={t}>#{t}</Chip>
                ))}
              </div>
            </Field>
          )}

          <button
            onClick={() => {
              deleteTask(task.id);
              onClose();
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink-faint transition hover:border-red hover:text-red"
          >
            <Trash2 size={13} />
            Delete task
          </button>
        </aside>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}
