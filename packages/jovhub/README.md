# `jovhub`

JovHub CLI — install, update, search, and publish agent skills as folders.

## Install

```bash
# From this repo (shortcut script at repo root)
bun jovhub --help

# Once published to npm
# npm i -g jovhub
```

## Auth (publish)

```bash
jovhub login
# or
jovhub auth login

# Headless / token paste
# or (token paste / headless)
jovhub login --token clh_...
```

Notes:

- Browser login opens `https://hub.j0vebot.com/cli/auth` and completes via a loopback callback.
- Token stored in `~/Library/Application Support/jovhub/config.json` on macOS (override via `CLAWHUB_CONFIG_PATH`, legacy `CLAWDHUB_CONFIG_PATH`).

## Examples

```bash
jovhub search "postgres backups"
jovhub install my-skill-pack
jovhub update --all
jovhub update --all --no-input --force
jovhub publish ./my-skill-pack --slug my-skill-pack --name "My Skill Pack" --version 1.2.0 --changelog "Fixes + docs"
```

## Sync (upload local skills)

```bash
# Start anywhere; scans workdir first, then legacy JOVis/JOV/JOV/Moltbot locations.
jovhub sync

# Explicit roots + non-interactive dry-run
jovhub sync --root ../jovis/skills --all --dry-run
```

## Defaults

- Site: `https://hub.j0vebot.com` (override via `--site` or `CLAWHUB_SITE`, legacy `CLAWDHUB_SITE`)
- Registry: discovered from `/.well-known/jovhub.json` on the site (legacy `/.well-known/jovhub.json`; override via `--registry` or `CLAWHUB_REGISTRY`)
- Workdir: current directory (falls back to JOV workspace if configured; override via `--workdir` or `CLAWHUB_WORKDIR`)
- Install dir: `./skills` under workdir (override via `--dir`)
