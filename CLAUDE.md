# agenticos-dashboard

vault_project: goflowtics

AgenticOS cockpit dashboard — local-first SvelteKit app that reads a tenant vault and launches Claude Code skill runs.

## Stack

- SvelteKit + TypeScript
- Tailwind v4 (@tailwindcss/vite)
- adapter-node (local server)
- `yaml` for vault file parsing

## Dev

```bash
cp .env.dev .env    # first time
npm run dev         # port 3030
```

## Vault config

Set `VAULT_PATH` in `.env` to point at the tenant vault. Default: `~/Work/goflowtics-vault`.

## Architecture

- `src/lib/server/vault.ts` — reads tenant.yaml, domains/*.md, skill dirs
- `src/lib/server/runner.ts` — spawns `claude -p <prompt>` subprocess, streams stdout, writes runs/audit JSONL
- `src/routes/api/vault` — GET: tenant + domains + skills
- `src/routes/api/run` — POST: start a skill run, returns runId
- `src/routes/api/stream/[runId]` — GET: SSE stream of run output
- `src/routes/api/runs` — GET: recent run records
- `src/lib/components/SkillsGrid.svelte` — 9-column domain grid
- `src/lib/components/RunPanel.svelte` — live SSE stream output
- `src/lib/components/RecentRuns.svelte` — recent run history

## Phase

Phase 6 (Dashboard v0 — local cockpit). See implementation plan at `~/Work/obsidian/Resources/agenticos/Implementation-Plan.md`.
