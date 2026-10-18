# AGENTS.md — custom-web-agency

<!-- CLAUDE.md in this repo is just: @AGENTS.md -->

## Stack
Next.js 16.2.10 (App Router, `src/`) · React 19.2 · TypeScript · Tailwind v4 · zustand · lucide-react.
**Frontend only** — no backend, no API routes, no DB. Mock data in `src/lib/seed.ts`, mutated
through the in-memory store `src/lib/store.ts` (zustand + localStorage persist).

## Loadouts (equip what applies)
@~/.claude/rules/ecc/common/coding-style.md
<!-- core packs (common/karpathy/git/security/windows) are always on via global CLAUDE.md -->
@~/.claude/rules/loadout/profiles/web.md
<!-- mobile → profiles/mobile.md · api → profiles/api.md · agents → profiles/agents.md -->

## Golden rule
Pull current docs via **Context7** for the exact installed version before coding. Don't trust training memory.

## Memory (read at session start, update at session end)
- `PROJECT.md`  — current status
- `DECISIONS.md` — why we chose things
- `MISTAKES.md`  — pitfalls to not repeat
- `CONTRACT.md`  — plan for a high-risk change; create before, delete after verify
