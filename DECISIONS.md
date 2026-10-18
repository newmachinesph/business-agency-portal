# DECISIONS — Hub (custom-web-agency)

<!-- Append-only. One entry per real decision. Keeps future-you from re-litigating. -->

## 2026-07-12 — State layer
**Chose:** one zustand store (`src/lib/store.ts`) with `persist` + `skipHydration`, rehydrated from
`AppShell` via `useSyncExternalStore`.
**Over:** React Context, TanStack Query, a fake API layer.
**Why:** no backend exists, so there is no server state to cache. `skipHydration` keeps SSR output
deterministic; pages render only after the client rehydrates, which kills a whole class of
hydration mismatches (dates, localStorage).

## 2026-07-12 — Drag-and-drop
**Chose:** native HTML5 drag events for the kanban board and file moves.
**Over:** dnd-kit / react-beautiful-dnd.
**Why:** two drag surfaces with simple semantics; the browser already does this in ~10 lines.

## 2026-07-12 — Uploads are metadata-only
**Chose:** `uploadFile(name, size, parentId)` stores name/ext/size from the real `File`, never bytes.
**Over:** base64 into localStorage.
**Why:** localStorage is ~5 MB; a demo drive with real bytes would blow it up on the first upload.

## 2026-07-12 — No nested interactive elements
**Chose:** file/folder cards are `div role="button"`, not `<button>`.
**Why:** row action buttons live inside the card. `<button>` inside `<button>` is invalid HTML and
the browser silently restructures the DOM, which broke the card layout.
