# PROJECT — Hub (custom-web-agency)

<!-- ≤30 lines. Current status only. Update at end of each session. -->

**What:** Frontend-only prototype of one workspace combining ClickUp (tasks), Everhour (time),
Google Drive/Dropbox (files) and Slack (chat).
**Stack:** Next.js 16.2.10 App Router (`src/`) · React 19.2 · Tailwind v4 · zustand · lucide-react.
No backend — mock data in `src/lib/seed.ts`, all mutations in `src/lib/store.ts` (localStorage persist).

**Status:** all 5 routes work, lint + build green.
- `/` dashboard: KPIs, focus list, project budget bars, activity, recent files
- `/tasks` ClickUp: kanban with native drag-drop + list view, filters, task modal (status, priority,
  assignee, due, subtasks, comments, tracked-vs-estimate, start timer, delete), inline create
- `/time` Everhour: live global timer pill (start/stop → logs an entry), editable week timesheet
  (`1:30` / `1.5` / `90m`), week nav, me/team scope, daily bar chart, per-project + per-user rollups
- `/files` Drive: folder tree + breadcrumbs, grid/list, real drag-and-drop upload (size only, no bytes),
  new folder, rename, star, share, delete (recursive), move by dragging onto a folder, preview modal
- `/chat` Slack: channels + DMs, unread badges, threads, reactions, attachment and task unfurls

**Now working on:** —
**Next:** search bar (⌘K) is decorative; no mobile layout below `md` for chat/files sidebars.
**Blockers:** none
