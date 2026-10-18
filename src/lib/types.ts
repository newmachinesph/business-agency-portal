export type Id = string;

export type User = {
  id: Id;
  name: string;
  initials: string;
  color: string;
  role: string;
  status: "online" | "away" | "offline";
};

export type Project = {
  id: Id;
  name: string;
  color: string;
  client: string;
  budgetHours: number;
};

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type Priority = "urgent" | "high" | "normal" | "low";

export type Task = {
  id: Id;
  key: string;
  title: string;
  description: string;
  projectId: Id;
  status: TaskStatus;
  priority: Priority;
  assigneeId: Id | null;
  dueDate: string | null; // yyyy-mm-dd
  tags: string[];
  estimateMinutes: number;
  subtasks: { id: Id; title: string; done: boolean }[];
  comments: { id: Id; authorId: Id; body: string; at: string }[];
  createdAt: string;
};

/** Minutes logged by a user against a task on a given day. */
export type TimeEntry = {
  id: Id;
  taskId: Id;
  userId: Id;
  date: string; // yyyy-mm-dd
  minutes: number;
  note: string;
  billable: boolean;
};

export type RunningTimer = {
  taskId: Id;
  startedAt: number; // epoch ms
  note: string;
} | null;

export type FileNode = {
  id: Id;
  name: string;
  kind: "folder" | "file";
  parentId: Id | null;
  ext?: string;
  size?: number; // bytes
  ownerId: Id;
  updatedAt: string;
  starred: boolean;
  shared: boolean;
  projectId?: Id;
};

export type Channel = {
  id: Id;
  name: string;
  kind: "channel" | "dm";
  topic: string;
  memberIds: Id[];
  private: boolean;
};

export type Message = {
  id: Id;
  channelId: Id;
  authorId: Id;
  body: string;
  at: string; // ISO
  parentId: Id | null; // thread replies
  reactions: { emoji: string; userIds: Id[] }[];
  attachmentId?: Id; // FileNode
  taskId?: Id; // task unfurl
};
