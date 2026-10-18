"use client";

import Link from "next/link";
import { ArrowUpRight, CheckSquare, Clock, FolderOpen, MessagesSquare } from "lucide-react";
import { useStore, STATUSES, PRIORITY_COLOR } from "@/lib/store";
import { hm, relTime, due, weekDates, bytes } from "@/lib/format";
import { Avatar, Chip, Progress, SectionTitle } from "@/components/ui";

export default function HomePage() {
  const { tasks, entries, projects, files, messages, channels, users, currentUserId } = useStore();

  const week = weekDates(0);
  const myWeek = entries.filter((e) => e.userId === currentUserId && week.includes(e.date));
  const myMinutes = myWeek.reduce((n, e) => n + e.minutes, 0);
  const billableMinutes = myWeek.filter((e) => e.billable).reduce((n, e) => n + e.minutes, 0);

  const myTasks = tasks
    .filter((t) => t.status !== "done")
    .filter((t) => t.assigneeId === currentUserId || t.status === "in_progress")
    .slice(0, 6);

  const openTasks = tasks.filter((t) => t.status !== "done");
  const overdue = openTasks.filter((t) => t.dueDate && due(t.dueDate)?.tone === "late");
  const recent = [...messages].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  const recentFiles = [...files]
    .filter((f) => f.kind === "file")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  const kpis = [
    {
      label: "Tracked this week",
      value: hm(myMinutes),
      hint: `${hm(billableMinutes)} billable`,
      icon: Clock,
      color: "#7c5cff",
      href: "/time",
    },
    {
      label: "Open tasks",
      value: String(openTasks.length),
      hint: `${overdue.length} overdue`,
      icon: CheckSquare,
      color: "#12b981",
      href: "/tasks",
    },
    {
      label: "Files",
      value: String(files.filter((f) => f.kind === "file").length),
      hint: `${bytes(files.reduce((n, f) => n + (f.size ?? 0), 0))} stored`,
      icon: FolderOpen,
      color: "#f59e0b",
      href: "/files",
    },
    {
      label: "Messages",
      value: String(messages.length),
      hint: `across ${channels.length} channels`,
      icon: MessagesSquare,
      color: "#f0568c",
      href: "/chat",
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8">
          <p className="text-xs font-semibold tracking-[0.14em] text-ink-faint uppercase">
            Workspace overview
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
            Good to see you, {users.find((u) => u.id === currentUserId)?.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {overdue.length
              ? `${overdue.length} task${overdue.length > 1 ? "s are" : " is"} past due — worth a look.`
              : "Nothing is overdue. Quiet week so far."}
          </p>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Link
              key={k.label}
              href={k.href}
              className="group rounded-card border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(14,17,22,0.25)]"
            >
              <div className="flex items-start justify-between">
                <span
                  className="grid h-9 w-9 place-items-center rounded-[10px]"
                  style={{ background: `${k.color}1a`, color: k.color }}
                >
                  <k.icon size={17} />
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-ink-faint opacity-0 transition group-hover:opacity-100"
                />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-ink">
                {k.value}
              </p>
              <p className="text-xs font-medium text-ink-soft">{k.label}</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">{k.hint}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <SectionTitle
              title="Your focus"
              hint="Assigned to you or in flight"
              right={
                <Link href="/tasks" className="text-xs font-medium text-brand hover:underline">
                  All tasks
                </Link>
              }
            />
            <div className="divide-y divide-line-soft overflow-hidden rounded-card border border-line bg-surface">
              {myTasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId)!;
                const status = STATUSES.find((s) => s.id === t.status)!;
                const d = due(t.dueDate);
                const doneSubs = t.subtasks.filter((s) => s.done).length;
                return (
                  <Link
                    key={t.id}
                    href="/tasks"
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-canvas"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: PRIORITY_COLOR[t.priority] }}
                      title={t.priority}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-faint">
                        <span className="font-mono">{t.key}</span>
                        <span style={{ color: project.color }}>{project.name}</span>
                        {t.subtasks.length > 0 && (
                          <span>
                            {doneSubs}/{t.subtasks.length} subtasks
                          </span>
                        )}
                      </p>
                    </div>
                    <Chip color={status.color}>{status.label}</Chip>
                    {d && (
                      <span
                        className={`w-20 text-right text-[11px] font-medium ${
                          d.tone === "late"
                            ? "text-red"
                            : d.tone === "soon"
                              ? "text-amber"
                              : "text-ink-faint"
                        }`}
                      >
                        {d.label}
                      </span>
                    )}
                    <Avatar user={users.find((u) => u.id === t.assigneeId)} size={26} />
                  </Link>
                );
              })}
            </div>

            <div className="mt-6">
              <SectionTitle title="Project budgets" hint="Hours logged against budget" />
              <div className="space-y-4 rounded-card border border-line bg-surface p-5">
                {projects.map((p) => {
                  const ids = tasks.filter((t) => t.projectId === p.id).map((t) => t.id);
                  const mins = entries
                    .filter((e) => ids.includes(e.taskId))
                    .reduce((n, e) => n + e.minutes, 0);
                  const pct = (mins / 60 / p.budgetHours) * 100;
                  return (
                    <div key={p.id}>
                      <div className="mb-1.5 flex items-baseline justify-between text-xs">
                        <span className="font-medium text-ink">
                          {p.name}
                          <span className="ml-2 text-ink-faint">{p.client}</span>
                        </span>
                        <span className="tabular-nums text-ink-soft">
                          {hm(mins)} / {p.budgetHours}h
                          <span className="ml-2 font-semibold" style={{ color: p.color }}>
                            {pct.toFixed(0)}%
                          </span>
                        </span>
                      </div>
                      <Progress value={pct} color={p.color} />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <SectionTitle
                title="Activity"
                right={
                  <Link href="/chat" className="text-xs font-medium text-brand hover:underline">
                    Open chat
                  </Link>
                }
              />
              <div className="space-y-3 rounded-card border border-line bg-surface p-4">
                {recent.map((m) => {
                  const author = users.find((u) => u.id === m.authorId);
                  return (
                    <div key={m.id} className="flex gap-2.5">
                      <Avatar user={author} size={26} />
                      <div className="min-w-0">
                        <p className="text-xs">
                          <span className="font-semibold text-ink">{author?.name}</span>{" "}
                          <span className="text-ink-faint">{relTime(m.at)}</span>
                        </p>
                        <p className="line-clamp-2 text-xs text-ink-soft">{m.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <SectionTitle
                title="Recent files"
                right={
                  <Link href="/files" className="text-xs font-medium text-brand hover:underline">
                    Drive
                  </Link>
                }
              />
              <div className="divide-y divide-line-soft overflow-hidden rounded-card border border-line bg-surface">
                {recentFiles.map((f) => (
                  <Link
                    key={f.id}
                    href="/files"
                    className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-canvas"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-canvas font-mono text-[9px] font-bold text-ink-soft uppercase">
                      {f.ext}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink">{f.name}</p>
                      <p className="text-[11px] text-ink-faint">
                        {bytes(f.size)} · {relTime(f.updatedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
