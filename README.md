# ⚡ JovHub

**JovHub** is the public skill registry for **JOV** — a Grok-powered personal AI assistant.

Publish, version, and search text-based agent skills (`SKILL.md` + supporting files).
Browse and share system lore (`SOUL.md` bundles) via JovSouls.

Live: `https://hub.j0vebot.com` · JovSouls: `https://souls.j0vebot.com`

## Quick Start

```bash
npm install -g jovhub

jovhub login          # GitHub OAuth
jovhub publish ./     # Publish a skill
jovhub search "web"   # Vector search
jovhub install @user/skill
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `jovhub login` | Authenticate via GitHub |
| `jovhub publish <dir>` | Publish a skill or soul |
| `jovhub search <query>` | Search the registry |
| `jovhub install <name>` | Install a skill to workspace |
| `jovhub info <name>` | View skill details |

## How it works

- **Web app**: TanStack Start (React, Vite/Nitro)
- **Backend**: Convex (DB + file storage + HTTP actions + GitHub OAuth)
- **Search**: OpenAI embeddings + Convex vector search
- **CLI**: `jovhub` npm package

## Integration with JOV

```bash
jovebot skills install @username/web-scraper
# Skills go to ~/.jov/workspace/skills/
```

## Development

```bash
git clone https://github.com/J0VEBOT/jov-hub.git
cd jov-hub && bun install && bun dev
```

## $JOV

Token: `4qHkV14MAqHqM5eEX9YzeTNhdGnzDeWQYj8kXpQUjov0` · 1B supply · [j0vebot.com](https://j0vebot.com)

---

Built with ⚡ by the JOV community.
