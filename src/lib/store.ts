"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as seed from "./seed";
import type {
  Channel,
  FileNode,
  Id,
  Message,
  Project,
  RunningTimer,
  Task,
  TaskStatus,
  TimeEntry,
  User,
} from "./types";

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;
const today = () => new Date().toISOString().slice(0, 10);

type State = {
  users: User[];
  projects: Project[];
  tasks: Task[];
  entries: TimeEntry[];
  timer: RunningTimer;
  files: FileNode[];
  channels: Channel[];
  messages: Message[];
  currentUserId: Id;
  lastRead: Record<Id, string>; // channelId -> ISO
};

type Actions = {
  // tasks
  addTask: (t: Partial<Task> & { title: string; projectId: Id }) => Id;
  updateTask: (id: Id, patch: Partial<Task>) => void;
  moveTask: (id: Id, status: TaskStatus) => void;
  deleteTask: (id: Id) => void;
  toggleSubtask: (taskId: Id, subtaskId: Id) => void;
  addSubtask: (taskId: Id, title: string) => void;
  addComment: (taskId: Id, body: string) => void;

  // time
  startTimer: (taskId: Id, note?: string) => void;
  stopTimer: () => void;
  discardTimer: () => void;
  addEntry: (e: Omit<TimeEntry, "id">) => void;
  updateEntry: (id: Id, patch: Partial<TimeEntry>) => void;
  deleteEntry: (id: Id) => void;

  // files
  addFolder: (name: string, parentId: Id | null) => void;
  uploadFile: (name: string, size: number, parentId: Id | null) => void;
  renameNode: (id: Id, name: string) => void;
  deleteNode: (id: Id) => void;
  toggleStar: (id: Id) => void;
  toggleShare: (id: Id) => void;
  moveNode: (id: Id, parentId: Id | null) => void;

  // chat
  sendMessage: (channelId: Id, body: string, parentId?: Id | null) => void;
  toggleReaction: (messageId: Id, emoji: string) => void;
  markRead: (channelId: Id) => void;
  addChannel: (name: string, isPrivate: boolean) => void;

  reset: () => void;
};

const initial = (): State => ({
  users: seed.users,
  projects: seed.projects,
  tasks: seed.tasks,
  entries: seed.timeEntries,
  timer: null,
  files: seed.files,
  channels: seed.channels,
  messages: seed.messages,
  currentUserId: seed.CURRENT_USER_ID,
  lastRead: { ch1: new Date(Date.now() - 7 * 3600_000).toISOString() },
});

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),

      addTask: ({ title, projectId, ...rest }) => {
        const id = uid("t");
        const project = get().projects.find((p) => p.id === projectId);
        const prefix = (project?.name ?? "TSK").slice(0, 3).toUpperCase();
        const n = get().tasks.filter((t) => t.projectId === projectId).length + 1;
        const task: Task = {
          id,
          key: `${prefix}-${String(n).padStart(2, "0")}`,
          title,
          description: "",
          projectId,
          status: "todo",
          priority: "normal",
          assigneeId: null,
          dueDate: null,
          tags: [],
          estimateMinutes: 0,
          subtasks: [],
          comments: [],
          createdAt: today(),
          ...rest,
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return id;
      },

      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      moveTask: (id, status) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          entries: s.entries.filter((e) => e.taskId !== id),
          timer: s.timer?.taskId === id ? null : s.timer,
        })),

      toggleSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  subtasks: t.subtasks.map((sub) =>
                    sub.id === subtaskId ? { ...sub, done: !sub.done } : sub,
                  ),
                },
          ),
        })),

      addSubtask: (taskId, title) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id !== taskId
              ? t
              : { ...t, subtasks: [...t.subtasks, { id: uid("s"), title, done: false }] },
          ),
        })),

      addComment: (taskId, body) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  comments: [
                    ...t.comments,
                    { id: uid("c"), authorId: s.currentUserId, body, at: new Date().toISOString() },
                  ],
                },
          ),
        })),

      startTimer: (taskId, note = "") => {
        const running = get().timer;
        if (running) get().stopTimer();
        set({ timer: { taskId, startedAt: Date.now(), note } });
      },

      stopTimer: () => {
        const { timer, currentUserId } = get();
        if (!timer) return;
        const minutes = Math.max(1, Math.round((Date.now() - timer.startedAt) / 60_000));
        const entry: TimeEntry = {
          id: uid("e"),
          taskId: timer.taskId,
          userId: currentUserId,
          date: today(),
          minutes,
          note: timer.note || "Tracked with timer",
          billable: true,
        };
        set((s) => ({ entries: [entry, ...s.entries], timer: null }));
      },

      discardTimer: () => set({ timer: null }),

      addEntry: (e) => set((s) => ({ entries: [{ ...e, id: uid("e") }, ...s.entries] })),

      updateEntry: (id, patch) =>
        set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),

      deleteEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      addFolder: (name, parentId) =>
        set((s) => ({
          files: [
            {
              id: uid("f"),
              name,
              kind: "folder",
              parentId,
              ownerId: s.currentUserId,
              updatedAt: new Date().toISOString(),
              starred: false,
              shared: false,
            },
            ...s.files,
          ],
        })),

      uploadFile: (name, size, parentId) =>
        set((s) => ({
          files: [
            {
              id: uid("f"),
              name,
              kind: "file",
              ext: name.includes(".") ? name.split(".").pop()! : "bin",
              size,
              parentId,
              ownerId: s.currentUserId,
              updatedAt: new Date().toISOString(),
              starred: false,
              shared: false,
            },
            ...s.files,
          ],
        })),

      renameNode: (id, name) =>
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, name, updatedAt: new Date().toISOString() } : f,
          ),
        })),

      deleteNode: (id) =>
        set((s) => {
          const doomed = new Set<Id>([id]);
          let grew = true;
          while (grew) {
            grew = false;
            for (const f of s.files) {
              if (f.parentId && doomed.has(f.parentId) && !doomed.has(f.id)) {
                doomed.add(f.id);
                grew = true;
              }
            }
          }
          return { files: s.files.filter((f) => !doomed.has(f.id)) };
        }),

      toggleStar: (id) =>
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f)),
        })),

      toggleShare: (id) =>
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, shared: !f.shared } : f)),
        })),

      moveNode: (id, parentId) =>
        set((s) => (id === parentId ? s : { files: s.files.map((f) => (f.id === id ? { ...f, parentId } : f)) })),

      sendMessage: (channelId, body, parentId = null) =>
        set((s) => {
          const at = new Date().toISOString();
          const msg: Message = {
            id: uid("m"),
            channelId,
            authorId: s.currentUserId,
            body,
            at,
            parentId,
            reactions: [],
          };
          return { messages: [...s.messages, msg], lastRead: { ...s.lastRead, [channelId]: at } };
        }),

      toggleReaction: (messageId, emoji) =>
        set((s) => ({
          messages: s.messages.map((m) => {
            if (m.id !== messageId) return m;
            const me = s.currentUserId;
            const existing = m.reactions.find((r) => r.emoji === emoji);
            if (!existing) return { ...m, reactions: [...m.reactions, { emoji, userIds: [me] }] };
            const has = existing.userIds.includes(me);
            const userIds = has
              ? existing.userIds.filter((u) => u !== me)
              : [...existing.userIds, me];
            return {
              ...m,
              reactions: m.reactions
                .map((r) => (r.emoji === emoji ? { ...r, userIds } : r))
                .filter((r) => r.userIds.length > 0),
            };
          }),
        })),

      markRead: (channelId) =>
        set((s) => ({ lastRead: { ...s.lastRead, [channelId]: new Date().toISOString() } })),

      addChannel: (name, isPrivate) =>
        set((s) => ({
          channels: [
            ...s.channels,
            {
              id: uid("ch"),
              name: name.toLowerCase().replace(/\s+/g, "-"),
              kind: "channel",
              topic: "",
              memberIds: [s.currentUserId],
              private: isPrivate,
            },
          ],
        })),

      reset: () => set(initial()),
    }),
    {
      name: "agency-os",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // rehydrated in AppShell after mount — avoids SSR mismatch
    },
  ),
);

// ---- derived helpers (plain functions, not hooks) ----

export const STATUSES: { id: TaskStatus; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "#8b93a7" },
  { id: "todo", label: "To Do", color: "#3b82f6" },
  { id: "in_progress", label: "In Progress", color: "#f59e0b" },
  { id: "review", label: "In Review", color: "#a855f7" },
  { id: "done", label: "Done", color: "#12b981" },
];

export const PRIORITY_COLOR: Record<Task["priority"], string> = {
  urgent: "#ef4444",
  high: "#f59e0b",
  normal: "#3b82f6",
  low: "#8b93a7",
};

export function minutesOnTask(entries: TimeEntry[], taskId: Id) {
  return entries.filter((e) => e.taskId === taskId).reduce((n, e) => n + e.minutes, 0);
}
