"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, DollarSign, Play, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { hm, weekDates, dayLabel, isToday } from "@/lib/format";
import { Avatar, Chip, SectionTitle } from "@/components/ui";
import type { Id } from "@/lib/types";

/** "1:30" | "1.5" | "90m" | "" -> minutes */
function parseDuration(raw: string): number {
  const s = raw.trim().toLowerCase();
  if (!s) return 0;
  if (s.includes(":")) {
    const [h, m] = s.split(":");
    return (Number(h) || 0) * 60 + (Number(m) || 0);
  }
  if (s.endsWith("m")) return Number(s.slice(0, -1)) || 0;
  return Math.round((Number(s.replace("h", "")) || 0) * 60);
}

export default function TimePage() {
  const { tasks, projects, entries, users, currentUserId, addEntry, deleteEntry, startTimer } =
    useStore();

  const [weekOffset, setWeekOffset] = useState(0);
  const [scope, setScope] = useState<"me" | "team">("me");
  const [adding, setAdding] = useState(false);

  const week = useMemo(() => weekDates(weekOffset), [weekOffset]);
  const inWeek = entries.filter((e) => week.includes(e.date));
  const mine = inWeek.filter((e) => e.userId === currentUserId);
  const scoped = scope === "me" ? mine : inWeek;

  // timesheet rows: my tasks with time this week
  const rowTaskIds = Array.from(new Set(mine.map((e) => e.taskId)));

  const cellMinutes = (taskId: Id, date: string) =>
    mine
      .filter((e) => e.taskId === taskId && e.date === date)
      .reduce((n, e) => n + e.minutes, 0);

  function setCell(taskId: Id, date: string, raw: string) {
    const minutes = parseDuration(raw);
    const existing = entries.filter(
      (e) => e.taskId === taskId && e.date === date && e.userId === currentUserId,
    );
    if (minutes === cellMinutes(taskId, date)) return;
    existing.forEach((e) => deleteEntry(e.id));
    if (minutes > 0) {
      addEntry({
        taskId,
        userId: currentUserId,
        date,
        minutes,
        note: "Timesheet entry",
        billable: true,
      });
    }
  }

  const dayTotals = week.map((d) =>
    scoped.filter((e) => e.date === d).reduce((n, e) => n + e.minutes, 0),
  );
  const weekTotal = dayTotals.reduce((a, b) => a + b, 0);
  const billable = scoped.filter((e) => e.billable).reduce((n, e) => n + e.minutes, 0);
  const maxDay = Math.max(...dayTotals, 60);

  const byProject = projects
    .map((p) => {
      const ids = tasks.filter((t) => t.projectId === p.id).map((t) => t.id);
      const minutes = scoped.filter((e) => ids.includes(e.taskId)).reduce((n, e) => n + e.minutes, 0);
      return { ...p, minutes };
    })
    .filter((p) => p.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  const byUser = users
    .map((u) => ({
      ...u,
      minutes: inWeek.filter((e) => e.userId === u.id).reduce((n, e) => n + e.minutes, 0),
    }))
    .filter((u) => u.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  const untrackedTasks = tasks.filter((t) => !rowTaskIds.includes(t.id) && t.status !== "done");

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-ink">Time</h1>

          <div className="flex items-center gap-1 rounded-[10px] border border-line bg-surface px-1 py-0.5">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="rounded-md p-1.5 text-ink-faint transition hover:bg-canvas hover:text-ink"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="min-w-[150px] text-center text-xs font-medium text-ink">
              {weekOffset === 0
                ? "This week"
                : weekOffset === -1
                  ? "Last week"
                  : `${dayLabel(week[0]).dow} ${dayLabel(week[0]).num} — ${dayLabel(week[6]).num}`}
            </span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="rounded-md p-1.5 text-ink-faint transition hover:bg-canvas hover:text-ink"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="flex rounded-[10px] bg-canvas p-0.5">
            {(["me", "team"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  scope === s ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="text-lg font-semibold tabular-nums text-ink">{hm(weekTotal)}</p>
              <p className="text-[11px] text-ink-faint">week total</p>
            </div>
            <div className="text-right">
              <p className="flex items-center gap-1 text-lg font-semibold tabular-nums text-mint">
                <DollarSign size={15} />
                {hm(billable)}
              </p>
              <p className="text-[11px] text-ink-faint">billable</p>
            </div>
          </div>
        </div>

        {/* timesheet */}
        <div className="mb-6 overflow-hidden rounded-card border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas text-[11px] tracking-wide text-ink-faint uppercase">
                <th className="px-4 py-2.5 text-left font-semibold">Task</th>
                {week.map((d) => {
                  const l = dayLabel(d);
                  return (
                    <th
                      key={d}
                      className={`w-[72px] py-2.5 text-center font-semibold ${
                        isToday(d) ? "text-brand" : ""
                      }`}
                    >
                      {l.dow} <span className="font-normal">{l.num}</span>
                    </th>
                  );
                })}
                <th className="w-20 px-3 py-2.5 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rowTaskIds.map((taskId) => {
                const task = tasks.find((t) => t.id === taskId);
                if (!task) return null;
                const project = projects.find((p) => p.id === task.projectId)!;
                const total = week.reduce((n, d) => n + cellMinutes(taskId, d), 0);
                return (
                  <tr key={taskId} className="group">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startTimer(task.id, task.title)}
                          title="Start timer"
                          className="rounded-md p-1 text-ink-faint opacity-0 transition group-hover:opacity-100 hover:bg-mint/15 hover:text-mint"
                        >
                          <Play size={12} />
                        </button>
                        <span className="font-medium text-ink">{task.title}</span>
                        <Chip color={project.color}>{project.name}</Chip>
                      </div>
                    </td>
                    {week.map((d) => {
                      const v = cellMinutes(taskId, d);
                      return (
                        <td key={d} className={`text-center ${isToday(d) ? "bg-brand-soft/40" : ""}`}>
                          <input
                            defaultValue={v ? (v / 60).toFixed(2).replace(/\.00$/, "") : ""}
                            key={`${taskId}-${d}-${v}`}
                            onBlur={(e) => setCell(taskId, d, e.target.value)}
                            placeholder="—"
                            className="h-9 w-16 rounded-md border border-transparent bg-transparent text-center text-sm tabular-nums outline-none placeholder:text-ink-faint/60 hover:border-line focus:border-brand focus:bg-surface"
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums text-ink">
                      {total ? hm(total) : "—"}
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td className="px-4 py-2" colSpan={9}>
                  {adding ? (
                    <select
                      autoFocus
                      defaultValue=""
                      onChange={(e) => {
                        const id = e.target.value;
                        if (id) {
                          addEntry({
                            taskId: id,
                            userId: currentUserId,
                            date: week[Math.min(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1, 6)],
                            minutes: 0,
                            note: "Timesheet entry",
                            billable: true,
                          });
                        }
                        setAdding(false);
                      }}
                      onBlur={() => setAdding(false)}
                      className="rounded-lg border border-brand bg-surface px-2 py-1.5 text-sm outline-none"
                    >
                      <option value="">Pick a task…</option>
                      {untrackedTasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.key} · {t.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setAdding(true)}
                      className="flex items-center gap-1.5 text-xs font-medium text-ink-faint transition hover:text-brand"
                    >
                      <Plus size={14} /> Add row
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-line bg-canvas text-xs font-semibold text-ink">
                <td className="px-4 py-2.5 text-[11px] tracking-wide text-ink-faint uppercase">
                  {scope === "me" ? "My total" : "Team total"}
                </td>
                {dayTotals.map((m, i) => (
                  <td key={week[i]} className="py-2.5 text-center tabular-nums">
                    {m ? hm(m) : "—"}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right tabular-nums">{hm(weekTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <SectionTitle title="Daily hours" hint={scope === "me" ? "Your week" : "Whole team"} />
            <div className="flex h-56 items-end gap-3 rounded-card border border-line bg-surface p-5">
              {week.map((d, i) => {
                const m = dayTotals[i];
                const l = dayLabel(d);
                return (
                  <div key={d} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[11px] font-medium tabular-nums text-ink-soft">
                      {m ? hm(m) : ""}
                    </span>
                    <div
                      className="w-full rounded-t-md transition-[height] duration-500"
                      style={{
                        height: `${Math.max(2, (m / maxDay) * 140)}px`,
                        background: isToday(d) ? "#7c5cff" : m ? "#c9c0ff" : "#eff1f6",
                      }}
                    />
                    <span
                      className={`text-[11px] ${isToday(d) ? "font-semibold text-brand" : "text-ink-faint"}`}
                    >
                      {l.dow}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <SectionTitle title="By project" />
              <div className="space-y-3 rounded-card border border-line bg-surface p-4">
                {byProject.map((p) => (
                  <div key={p.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-ink">{p.name}</span>
                      <span className="tabular-nums text-ink-soft">{hm(p.minutes)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(p.minutes / weekTotal) * 100}%`,
                          background: p.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {!byProject.length && <p className="text-xs text-ink-faint">No time this week.</p>}
              </div>
            </div>

            <div>
              <SectionTitle title="Team this week" />
              <div className="space-y-2.5 rounded-card border border-line bg-surface p-4">
                {byUser.map((u) => (
                  <div key={u.id} className="flex items-center gap-2.5">
                    <Avatar user={u} size={26} />
                    <span className="flex-1 truncate text-xs font-medium text-ink">{u.name}</span>
                    <span className="text-xs tabular-nums text-ink-soft">{hm(u.minutes)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
