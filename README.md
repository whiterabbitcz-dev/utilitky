# wr-tools

White Rabbit tools platform. Free utility tools for content creators, marketers, and designers.
Lives at `tools.whiterabbit.cz`.

## Stack

- pnpm workspaces
- Next.js 15 (App Router)
- TypeScript strict
- Tailwind CSS
- shadcn/ui
- Nunito (latin + latin-ext)

## Structure

```
apps/web              # Next.js app
packages/design       # Design tokens
packages/tool-kit     # Shared tool primitives (empty for now)
docs/                 # Internal docs
```

## Getting started

```bash
nvm use
pnpm install
pnpm dev
```

App runs at http://localhost:3000.

## Adding a tool

See `docs/adding-a-tool.md`.

## Brand rules

- Sentence case for all headings and labels (CAPS micro-tags excluded).
- No em-dashes anywhere. Use period, colon, comma, parens, or split into two sentences.
- Black dominates. Cyan accent is signal, not decoration.
- Czech diacritics correct. UTF-8 everywhere.
