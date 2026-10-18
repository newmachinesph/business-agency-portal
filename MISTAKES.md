# MISTAKES — Hub (custom-web-agency)

<!-- Recurring pitfalls. When something bites twice, write it here so the agent avoids it. -->

## Hover-only actions still take layout width
**Symptom:** file/folder card names collapsed to one character per line.
**Fix:** `opacity-0 group-hover:opacity-100` keeps the box in flow and starves the flexible sibling.
Use `hidden group-hover:block` (or absolute positioning) for hover-only action rows.

## React 19 lint rules in this repo are errors, not warnings
**Symptom:** `next build` passes but `eslint` fails on `react-hooks/purity`,
`set-state-in-effect`, `static-components`.
**Fix:** no `Date.now()` / `Math.random()` during render; no `setState` in an effect body (use
`useSyncExternalStore`); declare components at module scope, never inside another component's body.

## zustand persist and SSR
**Symptom:** `Cannot read properties of undefined (reading 'onFinishHydration')` during prerender.
**Fix:** never pass `useStore.persist.*` as a value at render time — wrap it:
`useSyncExternalStore((cb) => useStore.persist.onFinishHydration(cb), ...)`.
