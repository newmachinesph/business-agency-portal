"use client";

import { useEffect, useRef, useState } from "react";
import { Hash, Lock, MessageSquare, Paperclip, Plus, Send, SmilePlus } from "lucide-react";
import { useStore, STATUSES } from "@/lib/store";
import { relTime, timeOfDay, bytes } from "@/lib/format";
import { Avatar, Chip } from "@/components/ui";
import type { Id, Message } from "@/lib/types";

const EMOJI = ["👍", "🎉", "🔥", "👀", "✅", "😂"];

function Bubble({
  m,
  compact,
  onThread,
}: {
  m: Message;
  compact?: boolean;
  onThread: (id: Id) => void;
}) {
  const { users, files, tasks, projects, messages, currentUserId, toggleReaction } = useStore();

  const author = users.find((u) => u.id === m.authorId);
  const file = files.find((f) => f.id === m.attachmentId);
  const task = tasks.find((t) => t.id === m.taskId);
  const replyCount = messages.filter((x) => x.parentId === m.id).length;

  return (
    <div className="group relative flex gap-3 rounded-lg px-3 py-1.5 transition hover:bg-canvas">
      <div className="w-9 shrink-0">{!compact && <Avatar user={author} size={36} />}</div>
      <div className="min-w-0 flex-1">
        {!compact && (
          <p className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-ink">{author?.name}</span>
            <span className="text-[11px] text-ink-faint">{timeOfDay(m.at)}</span>
            <span className="text-[11px] text-ink-faint">· {relTime(m.at)}</span>
          </p>
        )}
        <p className="text-sm leading-relaxed text-ink-soft">{m.body}</p>

        {file && (
          <div className="mt-2 inline-flex items-center gap-2.5 rounded-[10px] border border-line bg-surface px-3 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-canvas font-mono text-[9px] font-bold text-ink-soft uppercase">
              {file.ext}
            </span>
            <div>
              <p className="text-xs font-medium text-ink">{file.name}</p>
              <p className="text-[11px] text-ink-faint">{bytes(file.size)}</p>
            </div>
            <Paperclip size={13} className="ml-2 text-ink-faint" />
          </div>
        )}

        {task && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-[10px] border border-line bg-surface px-3 py-2">
            <span
              className="h-4 w-1 rounded-full"
              style={{ background: projects.find((p) => p.id === task.projectId)?.color }}
            />
            <span className="font-mono text-[10px] text-ink-faint">{task.key}</span>
            <span className="text-xs font-medium text-ink">{task.title}</span>
            <Chip color={STATUSES.find((s) => s.id === task.status)!.color}>
              {STATUSES.find((s) => s.id === task.status)!.label}
            </Chip>
          </div>
        )}

        {(m.reactions.length > 0 || replyCount > 0) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {m.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => toggleReaction(m.id, r.emoji)}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
                  r.userIds.includes(currentUserId)
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-line bg-surface text-ink-soft hover:border-brand/40"
                }`}
              >
                {r.emoji} <span className="tabular-nums">{r.userIds.length}</span>
              </button>
            ))}
            {replyCount > 0 && !m.parentId && (
              <button
                onClick={() => onThread(m.id)}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-brand transition hover:underline"
              >
                <MessageSquare size={12} /> {replyCount} repl{replyCount === 1 ? "y" : "ies"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="absolute top-0 right-3 hidden items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5 shadow-sm group-hover:flex">
        {EMOJI.map((e) => (
          <button
            key={e}
            onClick={() => toggleReaction(m.id, e)}
            className="rounded-md px-1.5 py-1 text-sm transition hover:bg-canvas"
          >
            {e}
          </button>
        ))}
        {!m.parentId && (
          <button
            onClick={() => onThread(m.id)}
            title="Reply in thread"
            className="rounded-md p-1.5 text-ink-faint transition hover:bg-canvas hover:text-brand"
          >
            <MessageSquare size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-center gap-2 px-4 pb-1">
      <p className="text-[11px] font-semibold tracking-wide text-nav-text/60 uppercase">{label}</p>
      <div className="ml-auto">{children}</div>
    </div>
  );
}

export default function ChatPage() {
  const {
    channels,
    messages,
    users,
    currentUserId,
    lastRead,
    sendMessage,
    markRead,
    addChannel,
  } = useStore();

  const [activeId, setActiveId] = useState<Id>("ch2");
  const [thread, setThread] = useState<Id | null>(null);
  const [draft, setDraft] = useState("");
  const [threadDraft, setThreadDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const active = channels.find((c) => c.id === activeId)!;
  const roots = messages
    .filter((m) => m.channelId === activeId && !m.parentId)
    .sort((a, b) => a.at.localeCompare(b.at));
  const replies = (id: Id) =>
    messages.filter((m) => m.parentId === id).sort((a, b) => a.at.localeCompare(b.at));

  useEffect(() => {
    markRead(activeId);
  }, [activeId, markRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, messages.length]);

  const unreadIn = (id: Id) =>
    messages.filter(
      (m) =>
        m.channelId === id &&
        m.authorId !== currentUserId &&
        (!lastRead[id] || m.at > lastRead[id]),
    ).length;

  const threadRoot = messages.find((m) => m.id === thread);

  function send(body: string, parentId: Id | null) {
    const text = body.trim();
    if (!text) return;
    sendMessage(activeId, text, parentId);
  }

  return (
    <div className="flex h-full">
      <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto bg-nav-deep py-4 md:flex">
        <div className="px-4 pb-3">
          <p className="text-sm font-semibold text-white">Agency HQ</p>
          <p className="text-[11px] text-nav-text">{users.length} members</p>
        </div>

        <Group label="Channels">
          <button
            onClick={() => {
              const name = prompt("Channel name");
              if (name?.trim()) addChannel(name.trim(), false);
            }}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-nav-text/70 transition hover:bg-white/5 hover:text-white"
          >
            <Plus size={13} /> Add
          </button>
        </Group>

        <div className="space-y-0.5 px-2">
          {channels
            .filter((c) => c.kind === "channel")
            .map((c) => {
              const n = unreadIn(c.id);
              const on = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    setThread(null);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                    on ? "bg-brand text-white" : "text-nav-text hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {c.private ? <Lock size={13} /> : <Hash size={13} />}
                  <span className={`truncate ${n && !on ? "font-bold text-white" : ""}`}>
                    {c.name}
                  </span>
                  {n > 0 && !on && (
                    <span className="ml-auto grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        <Group label="Direct messages" />
        <div className="space-y-0.5 px-2">
          {channels
            .filter((c) => c.kind === "dm")
            .map((c) => {
              const other = users.find((u) => c.memberIds.includes(u.id) && u.id !== currentUserId);
              const n = unreadIn(c.id);
              const on = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    setThread(null);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                    on ? "bg-brand text-white" : "text-nav-text hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="relative">
                    <Avatar user={other} size={20} />
                    <span
                      className={`absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-nav-deep ${
                        other?.status === "online"
                          ? "bg-mint"
                          : other?.status === "away"
                            ? "bg-amber"
                            : "bg-ink-faint"
                      }`}
                    />
                  </span>
                  <span className={`truncate ${n && !on ? "font-bold text-white" : ""}`}>
                    {other?.name}
                  </span>
                  {n > 0 && !on && (
                    <span className="ml-auto grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-surface">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5">
          <h1 className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
            {active.kind === "channel" && (active.private ? <Lock size={15} /> : <Hash size={15} />)}
            {active.name}
          </h1>
          {active.topic && (
            <p className="truncate border-l border-line pl-3 text-xs text-ink-faint">
              {active.topic}
            </p>
          )}
          <div className="ml-auto flex -space-x-1.5">
            {active.memberIds.slice(0, 5).map((id) => (
              <Avatar key={id} user={users.find((u) => u.id === id)} size={26} ring />
            ))}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto py-4">
          {roots.map((m, i) => {
            const prev = roots[i - 1];
            const compact =
              prev &&
              prev.authorId === m.authorId &&
              new Date(m.at).getTime() - new Date(prev.at).getTime() < 5 * 60_000;
            return <Bubble key={m.id} m={m} compact={Boolean(compact)} onThread={setThread} />;
          })}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft, null);
            setDraft("");
          }}
          className="shrink-0 border-t border-line p-4"
        >
          <div className="flex items-end gap-2 rounded-xl border border-line bg-canvas p-2 focus-within:border-brand">
            <button
              type="button"
              onClick={() => setDraft((d) => `${d} 🙂`)}
              className="rounded-lg p-2 text-ink-faint transition hover:text-brand"
            >
              <SmilePlus size={16} />
            </button>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft, null);
                  setDraft("");
                }
              }}
              rows={1}
              placeholder={`Message ${active.kind === "channel" ? "#" : ""}${active.name}`}
              className="max-h-32 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-ink-faint"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-lg bg-brand p-2 text-white transition hover:bg-brand-deep disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>

      {threadRoot && (
        <aside className="hidden w-96 shrink-0 flex-col border-l border-line bg-surface xl:flex">
          <header className="flex h-14 items-center justify-between border-b border-line px-4">
            <h2 className="text-sm font-semibold text-ink">Thread</h2>
            <button
              onClick={() => setThread(null)}
              className="text-xs font-medium text-ink-faint transition hover:text-ink"
            >
              Close
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto py-3">
            <Bubble m={threadRoot} onThread={setThread} />
            <div className="my-2 flex items-center gap-2 px-4 text-[11px] text-ink-faint">
              <span className="h-px flex-1 bg-line" />
              {replies(threadRoot.id).length} replies
              <span className="h-px flex-1 bg-line" />
            </div>
            {replies(threadRoot.id).map((r) => (
              <Bubble key={r.id} m={r} onThread={setThread} />
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(threadDraft, threadRoot.id);
              setThreadDraft("");
            }}
            className="border-t border-line p-3"
          >
            <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas p-1.5 focus-within:border-brand">
              <input
                value={threadDraft}
                onChange={(e) => setThreadDraft(e.target.value)}
                placeholder="Reply…"
                className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-ink-faint"
              />
              <button
                type="submit"
                disabled={!threadDraft.trim()}
                className="rounded-lg bg-brand p-1.5 text-white transition hover:bg-brand-deep disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </aside>
      )}
    </div>
  );
}
