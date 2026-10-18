# Hub (business agency portal)

![License: MIT](https://img.shields.io/badge/license-MIT-green) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-61dafb) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

A frontend-only prototype of a single workspace for a small web agency, combining tasks (ClickUp-style), time tracking (Everhour-style), files (Drive-style) and team chat (Slack-style). There is no backend: data is mock seed data and changes persist in the browser's localStorage.

## Features

- `/` dashboard: KPIs, focus list, project budget bars, activity, recent files
- `/tasks` kanban (drag and drop) and list views, filters, task detail with subtasks and comments
- `/time` global timer, editable weekly timesheet, per-project and per-user rollups
- `/files` folder tree, grid/list, simulated upload, rename, star, move, preview
- `/chat` channels, DMs, threads, reactions

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Structure

```
src/app/         routes (dashboard, tasks, time, files, chat)
src/components/  app shell, task detail, shared UI
src/lib/         seed data, zustand store, types, formatters
```

Stack: Next.js (App Router), React, TypeScript, Tailwind CSS v4, zustand, lucide-react.

## License

MIT, see [LICENSE](LICENSE). Copyright (c) 2026 New Machine.
