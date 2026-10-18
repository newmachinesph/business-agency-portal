"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  CheckSquare,
  Clock,
  FolderOpen,
  LayoutDashboard,
  MessagesSquare,
  Pause,
  Play,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { clock } from "@/lib/format";
import { Avatar } from "@/components/ui";

const NAV = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/time", label: "Time", icon: Clock },
  { href: "/files", label: "Files", icon: FolderOpen },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
] as const;

/** Ticks every second — only mounted while a timer runs. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

function TimerPill() {
  const timer = useStore((s) => s.timer);
  const tasks = useStore((s) => s.tasks);
  const stopTimer = useStore((s) => s.stopTimer);
  const discardTimer = useStore((s) => s.discardTimer);
  const now = useNow(Boolean(timer));

  if (!timer) {
    return (
      <Link
        href="/time"
        className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand hover:text-brand"
      >
        <Play size={13} />
        Start timer
      </Link>
    );
  }

  const task = tasks.find((t) => t.id === timer.taskId);
  const seconds = (now - timer.startedAt) / 1000;

  return (
    <div className="flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 py-1 pr-1 pl-3">
      <span className="pulse-dot h-2 w-2 rounded-full bg-mint" />
      <span className="max-w-[180px] truncate text-xs font-medium text-ink-soft">
        {task?.key} {task?.title}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums text-ink">
        {clock(seconds)}
      </span>
      <button
        onClick={stopTimer}
        title="Stop and log time"
        className="rounded-full bg-mint p-1.5 text-white transition hover:bg-mint/85"
      >
        <Pause size={13} />
      </button>
      <button
        onClick={discardTimer}
        title="Discard"
        className="rounded-full p-1.5 text-ink-faint transition hover:bg-surface hover:text-red"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Store is created with skipHydration: read localStorage only on the client.
  const hydrated = useSyncExternalStore(
    (cb) => useStore.persist.onFinishHydration(cb),
    () => useStore.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    void useStore.persist.rehydrate();
  }, []);

  const me = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const messages = useStore((s) => s.messages);
  const lastRead = useStore((s) => s.lastRead);
  const currentUserId = useStore((s) => s.currentUserId);
  const reset = useStore((s) => s.reset);

  const unread = messages.filter(
    (m) =>
      m.authorId !== currentUserId &&
      (!lastRead[m.channelId] || m.at > lastRead[m.channelId]),
  ).length;

  return (
    <div className="flex h-full">
      <aside className="flex w-[74px] shrink-0 flex-col items-center gap-1 bg-nav py-4 lg:w-[212px] lg:items-stretch lg:px-3">
        <Link href="/" className="mb-4 flex items-center gap-2.5 px-2 lg:px-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-brand to-rose text-sm font-black text-white">
            H
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight text-white lg:block">
            Hub
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-nav-text hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute top-1/2 -left-3 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                )}
                <Icon size={18} className="shrink-0" />
                <span className="hidden lg:block">{label}</span>
                {label === "Chat" && unread > 0 && (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => confirm("Reset all demo data?") && reset()}
          className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-xs font-medium text-nav-text/70 transition hover:bg-white/5 hover:text-white"
          title="Reset demo data"
        >
          <RotateCcw size={16} className="shrink-0" />
          <span className="hidden lg:block">Reset demo</span>
        </button>

        <div className="mt-2 hidden items-center gap-2.5 rounded-[10px] bg-white/5 px-2.5 py-2 lg:flex">
          <Avatar user={me} size={30} />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{me?.name}</p>
            <p className="truncate text-[11px] text-nav-text">{me?.role}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface px-5">
          <label className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-[10px] bg-canvas px-3 text-sm">
            <Search size={15} className="text-ink-faint" />
            <input
              placeholder="Search tasks, files, people…"
              className="w-full bg-transparent outline-none placeholder:text-ink-faint"
            />
            <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-faint sm:block">
              ⌘K
            </kbd>
          </label>
          <div className="ml-auto flex items-center gap-3">
            <TimerPill />
            <Avatar user={me} size={30} ring />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          {hydrated ? children : <div className="p-8 text-sm text-ink-faint">Loading workspace…</div>}
        </main>
      </div>
    </div>
  );
}
