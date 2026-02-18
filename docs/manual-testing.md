---
summary: 'Copy/paste CLI smoke checklist for local verification.'
read_when:
  - Pre-merge validation
  - Reproducing a reported CLI bug
---

# Manual testing (CLI)

## Setup
- Ensure logged in: `bun jovhub whoami` (or `bun jovhub login`).
- Optional: set env
  - `CLAWHUB_SITE=https://hub.j0ve.bot`
  - `CLAWHUB_REGISTRY=https://hub.j0ve.bot`

## Smoke
- `bun jovhub --help`
- `bun jovhub --cli-version`
- `bun jovhub whoami`

## Search
- `bun jovhub search gif --limit 5`

## Install / list / update
- `mkdir -p /tmp/jovhub-manual && cd /tmp/jovhub-manual`
- `bunx jovhub@beta install gifgrep --force`
- `bunx jovhub@beta list`
- `bunx jovhub@beta update gifgrep --force`

## Publish (changelog optional)
- `mkdir -p /tmp/jovhub-skill-demo/SKILL && cd /tmp/jovhub-skill-demo`
- Create files:
  - `SKILL.md`
  - `notes.md`
- Publish:
  - `bun jovhub publish . --slug jovhub-manual-<ts> --name "Manual <ts>" --version 1.0.0 --tags latest`
- Publish update with empty changelog:
  - `bun jovhub publish . --slug jovhub-manual-<ts> --name "Manual <ts>" --version 1.0.1 --tags latest`

## Delete / undelete (owner/admin)
- `bun jovhub delete jovhub-manual-<ts> --yes`
- Verify hidden:
- `curl -i "https://hub.j0ve.bot/api/v1/skills/jovhub-manual-<ts>"`
- Restore:
  - `bun jovhub undelete jovhub-manual-<ts> --yes`
- Cleanup:
  - `bun jovhub delete jovhub-manual-<ts> --yes`

## Sync
- `bun jovhub sync --dry-run --all`

## Playwright (menu smoke)

Run against prod:

```
PLAYWRIGHT_BASE_URL=https://hub.j0ve.bot bun run test:pw
```

Run against a local preview server:

```
bun run test:e2e:local
```
