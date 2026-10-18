import type {
  Channel,
  FileNode,
  Message,
  Project,
  Task,
  TimeEntry,
  User,
} from "./types";

/** yyyy-mm-dd, n days from today (negative = past). */
export function day(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

export const CURRENT_USER_ID = "u1";

export const users: User[] = [
  { id: "u1", name: "Lina Barnes", initials: "LB", color: "#7c5cff", role: "Founder", status: "online" },
  { id: "u2", name: "Marcus Reed", initials: "MR", color: "#f0568c", role: "Design Lead", status: "online" },
  { id: "u3", name: "Priya Nair", initials: "PN", color: "#12b981", role: "Engineer", status: "away" },
  { id: "u4", name: "Tomás Ferreira", initials: "TF", color: "#f59e0b", role: "Engineer", status: "online" },
  { id: "u5", name: "Ada Okafor", initials: "AO", color: "#06b6d4", role: "PM", status: "offline" },
  { id: "u6", name: "Jonas Weber", initials: "JW", color: "#ef4444", role: "Copywriter", status: "away" },
];

export const projects: Project[] = [
  { id: "p1", name: "Orbit Rebrand", color: "#7c5cff", client: "Orbit Labs", budgetHours: 180 },
  { id: "p2", name: "Kestrel Web App", color: "#12b981", client: "Kestrel Health", budgetHours: 320 },
  { id: "p3", name: "Nimbus Campaign", color: "#f59e0b", client: "Nimbus Coffee", budgetHours: 90 },
];

export const tasks: Task[] = [
  {
    id: "t1", key: "ORB-14", title: "Design new marketing homepage",
    description: "Full above-the-fold rework: hero, social proof strip, pricing teaser. Ship Figma + tokens.",
    projectId: "p1", status: "in_progress", priority: "high", assigneeId: "u2",
    dueDate: day(2), tags: ["design", "web"], estimateMinutes: 960,
    subtasks: [
      { id: "s1", title: "Hero concepts x3", done: true },
      { id: "s2", title: "Social proof strip", done: true },
      { id: "s3", title: "Pricing teaser", done: false },
      { id: "s4", title: "Hand-off tokens", done: false },
    ],
    comments: [
      { id: "c1", authorId: "u5", body: "Client wants the logo strip above the fold.", at: hoursAgo(26) },
      { id: "c2", authorId: "u2", body: "Done — see v3 in the Figma. Pricing teaser next.", at: hoursAgo(4) },
    ],
    createdAt: day(-9),
  },
  {
    id: "t2", key: "ORB-15", title: "Logo lockup variations",
    description: "Horizontal, stacked, icon-only. Export SVG set.",
    projectId: "p1", status: "review", priority: "normal", assigneeId: "u2",
    dueDate: day(1), tags: ["design"], estimateMinutes: 300,
    subtasks: [{ id: "s5", title: "Export SVG set", done: true }],
    comments: [], createdAt: day(-12),
  },
  {
    id: "t3", key: "ORB-19", title: "Brand guidelines PDF",
    description: "Compile type, color, spacing, do/don't pages.",
    projectId: "p1", status: "todo", priority: "low", assigneeId: "u6",
    dueDate: day(9), tags: ["docs"], estimateMinutes: 480,
    subtasks: [], comments: [], createdAt: day(-3),
  },
  {
    id: "t4", key: "KES-02", title: "Patient intake form flow",
    description: "Multi-step form with validation + save-as-draft. Accessibility pass required.",
    projectId: "p2", status: "in_progress", priority: "urgent", assigneeId: "u3",
    dueDate: day(0), tags: ["frontend", "a11y"], estimateMinutes: 1440,
    subtasks: [
      { id: "s6", title: "Step machine", done: true },
      { id: "s7", title: "Field validation", done: true },
      { id: "s8", title: "Draft autosave", done: false },
      { id: "s9", title: "Screen reader pass", done: false },
    ],
    comments: [
      { id: "c3", authorId: "u3", body: "Autosave conflicts with the step machine — reworking.", at: hoursAgo(9) },
    ],
    createdAt: day(-15),
  },
  {
    id: "t5", key: "KES-05", title: "Auth + session handling",
    description: "Magic link sign-in, refresh, protected routes.",
    projectId: "p2", status: "done", priority: "high", assigneeId: "u4",
    dueDate: day(-2), tags: ["backend", "security"], estimateMinutes: 900,
    subtasks: [], comments: [], createdAt: day(-21),
  },
  {
    id: "t6", key: "KES-08", title: "Appointment calendar view",
    description: "Week/day toggle, drag to reschedule, clinician filter.",
    projectId: "p2", status: "todo", priority: "high", assigneeId: "u4",
    dueDate: day(5), tags: ["frontend"], estimateMinutes: 1200,
    subtasks: [{ id: "s10", title: "Week grid", done: false }, { id: "s11", title: "Drag reschedule", done: false }],
    comments: [], createdAt: day(-5),
  },
  {
    id: "t7", key: "KES-11", title: "Chart data export (CSV)",
    description: "Export filtered chart data with column picker.",
    projectId: "p2", status: "backlog", priority: "low", assigneeId: null,
    dueDate: null, tags: ["frontend"], estimateMinutes: 360,
    subtasks: [], comments: [], createdAt: day(-2),
  },
  {
    id: "t8", key: "KES-12", title: "Performance: dashboard TTI under 2s",
    description: "Code-split charts, defer non-critical JS, audit bundle.",
    projectId: "p2", status: "review", priority: "normal", assigneeId: "u3",
    dueDate: day(3), tags: ["perf"], estimateMinutes: 600,
    subtasks: [], comments: [], createdAt: day(-7),
  },
  {
    id: "t9", key: "NIM-01", title: "Launch email sequence (5 emails)",
    description: "Teaser, launch, social proof, objection, last call.",
    projectId: "p3", status: "in_progress", priority: "normal", assigneeId: "u6",
    dueDate: day(4), tags: ["copy"], estimateMinutes: 540,
    subtasks: [
      { id: "s12", title: "Teaser", done: true },
      { id: "s13", title: "Launch", done: true },
      { id: "s14", title: "Social proof", done: false },
    ],
    comments: [], createdAt: day(-6),
  },
  {
    id: "t10", key: "NIM-04", title: "Instagram asset pack",
    description: "9 stories + 6 grid posts, brand-safe crops.",
    projectId: "p3", status: "todo", priority: "urgent", assigneeId: "u2",
    dueDate: day(1), tags: ["design", "social"], estimateMinutes: 420,
    subtasks: [], comments: [], createdAt: day(-4),
  },
  {
    id: "t11", key: "NIM-06", title: "Landing page copy review",
    description: "Tighten headline + CTA, cut 30% of body copy.",
    projectId: "p3", status: "done", priority: "normal", assigneeId: "u5",
    dueDate: day(-1), tags: ["copy"], estimateMinutes: 180,
    subtasks: [], comments: [], createdAt: day(-8),
  },
  {
    id: "t12", key: "ORB-22", title: "Motion study for hero",
    description: "Scroll-linked reveal, reduced-motion fallback.",
    projectId: "p1", status: "backlog", priority: "normal", assigneeId: "u4",
    dueDate: day(12), tags: ["motion", "web"], estimateMinutes: 480,
    subtasks: [], comments: [], createdAt: day(-1),
  },
];

const T = (id: string) => id;

export const timeEntries: TimeEntry[] = [
  { id: "e1", taskId: T("t1"), userId: "u2", date: day(-4), minutes: 195, note: "Hero concepts", billable: true },
  { id: "e2", taskId: T("t1"), userId: "u2", date: day(-3), minutes: 240, note: "Social proof strip", billable: true },
  { id: "e3", taskId: T("t1"), userId: "u2", date: day(-1), minutes: 150, note: "Pricing teaser draft", billable: true },
  { id: "e4", taskId: T("t2"), userId: "u2", date: day(-2), minutes: 120, note: "Lockups", billable: true },
  { id: "e5", taskId: T("t4"), userId: "u3", date: day(-4), minutes: 330, note: "Step machine", billable: true },
  { id: "e6", taskId: T("t4"), userId: "u3", date: day(-2), minutes: 285, note: "Validation", billable: true },
  { id: "e7", taskId: T("t4"), userId: "u3", date: day(0), minutes: 95, note: "Autosave spike", billable: true },
  { id: "e8", taskId: T("t5"), userId: "u4", date: day(-5), minutes: 420, note: "Magic link", billable: true },
  { id: "e9", taskId: T("t6"), userId: "u4", date: day(-1), minutes: 180, note: "Week grid spike", billable: true },
  { id: "e10", taskId: T("t8"), userId: "u3", date: day(-3), minutes: 240, note: "Bundle audit", billable: false },
  { id: "e11", taskId: T("t9"), userId: "u6", date: day(-2), minutes: 210, note: "Teaser + launch", billable: true },
  { id: "e12", taskId: T("t9"), userId: "u6", date: day(0), minutes: 60, note: "Social proof email", billable: true },
  { id: "e13", taskId: T("t11"), userId: "u5", date: day(-2), minutes: 165, note: "Copy pass", billable: true },
  { id: "e14", taskId: T("t1"), userId: "u1", date: day(-1), minutes: 90, note: "Design review", billable: false },
  { id: "e15", taskId: T("t4"), userId: "u1", date: day(0), minutes: 45, note: "Standup + triage", billable: false },
  { id: "e16", taskId: T("t10"), userId: "u1", date: day(-3), minutes: 120, note: "Asset brief", billable: true },
  { id: "e17", taskId: T("t6"), userId: "u1", date: day(-4), minutes: 200, note: "Calendar scoping", billable: true },
  { id: "e18", taskId: T("t2"), userId: "u1", date: day(-2), minutes: 75, note: "Lockup feedback", billable: true },
];

export const files: FileNode[] = [
  { id: "f1", name: "Orbit Rebrand", kind: "folder", parentId: null, ownerId: "u2", updatedAt: hoursAgo(5), starred: true, shared: true, projectId: "p1" },
  { id: "f2", name: "Kestrel Web App", kind: "folder", parentId: null, ownerId: "u3", updatedAt: hoursAgo(30), starred: false, shared: true, projectId: "p2" },
  { id: "f3", name: "Nimbus Campaign", kind: "folder", parentId: null, ownerId: "u6", updatedAt: hoursAgo(52), starred: false, shared: false, projectId: "p3" },
  { id: "f4", name: "Agency Admin", kind: "folder", parentId: null, ownerId: "u1", updatedAt: hoursAgo(96), starred: true, shared: false },

  { id: "f10", name: "Logo Explorations", kind: "folder", parentId: "f1", ownerId: "u2", updatedAt: hoursAgo(6), starred: false, shared: true, projectId: "p1" },
  { id: "f11", name: "homepage-v3.fig", kind: "file", ext: "fig", size: 18_400_000, parentId: "f1", ownerId: "u2", updatedAt: hoursAgo(4), starred: true, shared: true, projectId: "p1" },
  { id: "f12", name: "brand-guidelines.pdf", kind: "file", ext: "pdf", size: 6_200_000, parentId: "f1", ownerId: "u6", updatedAt: hoursAgo(48), starred: false, shared: true, projectId: "p1" },
  { id: "f13", name: "hero-render.png", kind: "file", ext: "png", size: 3_100_000, parentId: "f1", ownerId: "u2", updatedAt: hoursAgo(9), starred: false, shared: false, projectId: "p1" },
  { id: "f14", name: "lockup-horizontal.svg", kind: "file", ext: "svg", size: 48_000, parentId: "f10", ownerId: "u2", updatedAt: hoursAgo(7), starred: false, shared: false, projectId: "p1" },
  { id: "f15", name: "lockup-stacked.svg", kind: "file", ext: "svg", size: 51_200, parentId: "f10", ownerId: "u2", updatedAt: hoursAgo(7), starred: false, shared: false, projectId: "p1" },

  { id: "f20", name: "Specs", kind: "folder", parentId: "f2", ownerId: "u5", updatedAt: hoursAgo(28), starred: false, shared: true, projectId: "p2" },
  { id: "f21", name: "intake-flow-spec.docx", kind: "file", ext: "docx", size: 820_000, parentId: "f20", ownerId: "u5", updatedAt: hoursAgo(27), starred: true, shared: true, projectId: "p2" },
  { id: "f22", name: "api-contract.json", kind: "file", ext: "json", size: 24_000, parentId: "f20", ownerId: "u4", updatedAt: hoursAgo(31), starred: false, shared: false, projectId: "p2" },
  { id: "f23", name: "perf-audit.csv", kind: "file", ext: "csv", size: 156_000, parentId: "f2", ownerId: "u3", updatedAt: hoursAgo(70), starred: false, shared: false, projectId: "p2" },
  { id: "f24", name: "kickoff-recording.mp4", kind: "file", ext: "mp4", size: 412_000_000, parentId: "f2", ownerId: "u5", updatedAt: hoursAgo(200), starred: false, shared: true, projectId: "p2" },

  { id: "f30", name: "email-sequence.md", kind: "file", ext: "md", size: 32_000, parentId: "f3", ownerId: "u6", updatedAt: hoursAgo(20), starred: true, shared: true, projectId: "p3" },
  { id: "f31", name: "ig-assets.zip", kind: "file", ext: "zip", size: 88_000_000, parentId: "f3", ownerId: "u2", updatedAt: hoursAgo(54), starred: false, shared: false, projectId: "p3" },

  { id: "f40", name: "sow-nimbus-2026.pdf", kind: "file", ext: "pdf", size: 1_400_000, parentId: "f4", ownerId: "u1", updatedAt: hoursAgo(120), starred: false, shared: false },
  { id: "f41", name: "retainer-rates.xlsx", kind: "file", ext: "xlsx", size: 96_000, parentId: "f4", ownerId: "u1", updatedAt: hoursAgo(300), starred: true, shared: false },
];

export const channels: Channel[] = [
  { id: "ch1", name: "general", kind: "channel", topic: "Agency-wide announcements", memberIds: users.map((u) => u.id), private: false },
  { id: "ch2", name: "orbit-rebrand", kind: "channel", topic: "Orbit Labs — brand + site", memberIds: ["u1", "u2", "u5", "u6"], private: false },
  { id: "ch3", name: "kestrel-app", kind: "channel", topic: "Kestrel Health web app build", memberIds: ["u1", "u3", "u4", "u5"], private: false },
  { id: "ch4", name: "design-crit", kind: "channel", topic: "Weekly crit — post work by Thursday", memberIds: ["u1", "u2", "u6"], private: true },
  { id: "ch5", name: "random", kind: "channel", topic: "Coffee, memes, dog photos", memberIds: users.map((u) => u.id), private: false },
  { id: "dm1", name: "Marcus Reed", kind: "dm", topic: "", memberIds: ["u1", "u2"], private: true },
  { id: "dm2", name: "Priya Nair", kind: "dm", topic: "", memberIds: ["u1", "u3"], private: true },
];

export const messages: Message[] = [
  { id: "m1", channelId: "ch1", authorId: "u5", body: "Morning all — sprint review moved to Thursday 3pm. Calendar updated.", at: hoursAgo(29), parentId: null, reactions: [{ emoji: "👍", userIds: ["u1", "u3", "u4"] }] },
  { id: "m2", channelId: "ch1", authorId: "u1", body: "Nimbus signed the retainer extension. Nice work everyone.", at: hoursAgo(26), parentId: null, reactions: [{ emoji: "🎉", userIds: ["u2", "u3", "u4", "u5", "u6"] }] },
  { id: "m3", channelId: "ch1", authorId: "u4", body: "Reminder: laptops need the security update by Friday.", at: hoursAgo(6), parentId: null, reactions: [] },

  { id: "m10", channelId: "ch2", authorId: "u2", body: "Homepage v3 is up. Hero is tighter, logo strip is above the fold now.", at: hoursAgo(5), parentId: null, reactions: [{ emoji: "🔥", userIds: ["u1", "u5"] }], attachmentId: "f11" },
  { id: "m11", channelId: "ch2", authorId: "u5", body: "That's exactly what the client asked for. Sending it over.", at: hoursAgo(4), parentId: "m10", reactions: [] },
  { id: "m12", channelId: "ch2", authorId: "u1", body: "Pricing teaser still open?", at: hoursAgo(4), parentId: "m10", reactions: [] },
  { id: "m13", channelId: "ch2", authorId: "u2", body: "Yep, on it today.", at: hoursAgo(3), parentId: "m10", reactions: [] },
  { id: "m14", channelId: "ch2", authorId: "u6", body: "Guidelines PDF is queued behind the email sequence — should be Monday.", at: hoursAgo(2), parentId: null, reactions: [], taskId: "t3" },

  { id: "m20", channelId: "ch3", authorId: "u3", body: "Draft autosave is fighting the step machine. Reworking the state model, may slip a day.", at: hoursAgo(9), parentId: null, reactions: [{ emoji: "👀", userIds: ["u4"] }], taskId: "t4" },
  { id: "m21", channelId: "ch3", authorId: "u4", body: "Want to pair on it after standup? I hit the same thing on the calendar view.", at: hoursAgo(8), parentId: "m20", reactions: [] },
  { id: "m22", channelId: "ch3", authorId: "u3", body: "Yes please. 11:00?", at: hoursAgo(8), parentId: "m20", reactions: [{ emoji: "✅", userIds: ["u4"] }] },
  { id: "m23", channelId: "ch3", authorId: "u5", body: "Intake spec updated with the clinician filter requirement.", at: hoursAgo(27), parentId: null, reactions: [], attachmentId: "f21" },
  { id: "m24", channelId: "ch3", authorId: "u4", body: "Auth is merged and deployed to staging. Magic links working end to end.", at: hoursAgo(50), parentId: null, reactions: [{ emoji: "🚀", userIds: ["u1", "u3", "u5"] }], taskId: "t5" },

  { id: "m30", channelId: "ch4", authorId: "u2", body: "Posting the lockup set for crit — horizontal reads best at small sizes.", at: hoursAgo(7), parentId: null, reactions: [], attachmentId: "f14" },
  { id: "m31", channelId: "ch4", authorId: "u6", body: "Agreed. Stacked feels cramped in the footer.", at: hoursAgo(6), parentId: null, reactions: [{ emoji: "💯", userIds: ["u2"] }] },

  { id: "m40", channelId: "ch5", authorId: "u4", body: "The espresso machine is fixed. Repeat: the espresso machine is fixed.", at: hoursAgo(11), parentId: null, reactions: [{ emoji: "☕", userIds: ["u1", "u2", "u3", "u5", "u6"] }] },
  { id: "m41", channelId: "ch5", authorId: "u3", body: "Heroic work.", at: hoursAgo(10), parentId: null, reactions: [] },

  { id: "m50", channelId: "dm1", authorId: "u2", body: "Can you look at the pricing teaser before I send it to Ada?", at: hoursAgo(3), parentId: null, reactions: [] },
  { id: "m51", channelId: "dm1", authorId: "u1", body: "Sure — drop it in the task and I'll review this afternoon.", at: hoursAgo(2), parentId: null, reactions: [] },
  { id: "m52", channelId: "dm2", authorId: "u3", body: "Logging extra hours on Kestrel this week, heads up on the budget.", at: hoursAgo(12), parentId: null, reactions: [] },
];
