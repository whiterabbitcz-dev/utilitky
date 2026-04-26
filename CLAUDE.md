# CLAUDE.md

Persistent context for Claude Code working in this repo.
Read this file before starting any task.

## What this repo is

`tools.whiterabbit.cz`. A public collection of free utility tools for content
creators, marketers, and designers. Soft marketing for White Rabbit agency.

Each tool solves one small daily pain. They share a common shell, design system,
and brand voice. The agency itself lives at whiterabbit.cz.

## Stack

- pnpm workspaces (monorepo)
- Next.js 15 with App Router, TypeScript strict
- Tailwind CSS
- Nunito from `next/font/google`, latin and latin-ext subsets
- shadcn/ui for primitive components
- Cloudflare Pages for hosting (later)
- Cloudflare Workers for server-side compute when needed (later)
- Supabase for auth (magic link) and Postgres (later)
- PostHog for analytics (later)

## Repo layout

```
apps/web/              # Next.js app, all tools live here
packages/design/       # design tokens, shared
packages/tool-kit/     # shared tool primitives (drop zone, export button, etc.)
docs/                  # internal docs, including adding-a-tool.md
```

## Design system

Source of truth: `packages/design/tokens.ts`. Always import from there.
Tailwind config in `apps/web/tailwind.config.ts` mirrors the tokens.

Color palette:

- Background: `#000000`, dark cards `#1A1A1A`, darker `#0A0A0A`
- Text: white `#FFFFFF`, gray `#888888`
- Accent: electric cyan `#00E5FF`, dark accent `#0F3D45` (text on accent fills)

Typography: Nunito only. Sentence case for all headings. CAPS labels with
`tracking-caps` (0.1em letter-spacing) for micro-tags only.

## Non-negotiable copy and design rules

These rules come from the White Rabbit cookbook and are enforced on every change.

1. **No em-dashes (`—`, U+2014) in anything users see.** Applies to all
   user-facing copy: UI strings, headings, button labels, meta titles and
   descriptions, marketing pages, changelog entries, error messages. Use
   period, colon, comma, parens, semicolon, or split into two sentences.
   Before committing user-facing changes, run `grep -rn '—' apps packages`
   and fix every hit. Em-dash is the most visible AI typography tell. We
   don't ship it. **Out of scope:** internal docs (handoff specs, READMEs
   in `docs/`, root-level notes), code comments, and commit messages. Those
   can use em-dashes freely if it reads better.
1. **Sentence case for Czech and English headings.** "Story safe zone", not
   "Story Safe Zone". First letter capitalized, rest lowercase except proper
   nouns and brand wordmarks. CAPS labels (NOVÉ, BETA, BRZY ZDE) are a
   different category and stay caps.
1. **Brand wordmark capitalization respected.** nutribullet (lowercase),
   eBay, iPhone, adidas. Don't auto-capitalize at sentence start. Match the
   brand's official logo and materials.
1. **Czech diacritics required in copy.** Files saved as UTF-8. Don't strip
   háčky and čárky. Nunito has full Czech support via the latin-ext subset.
1. **Black dominates** (~90% of viewport pixels). Cyan accent is signal,
   not decoration.
1. **Cyan accent only on**: active states, numbers, CAPS labels, primary CTA
   buttons, link hover, drop zone hover affordances, card border accents.
1. **No gradients, decorative lines under titles, generic line icons, stock
   illustrations, or emoji** (unless a specific tool's purpose requires emoji,
   and only with explicit approval).
1. **One idea per slide / one purpose per tool.** Each tool does one thing
   well. If scope creeps, propose a second tool instead.

## Component conventions

- Tool pages use `<ToolShell>` from `apps/web/components/tool-shell.tsx`.
  Required props: `title` (sentence case), `subtitle` (one descriptive
  sentence). Children render as the tool body.
- Cards use card format A (cyan border-left) for content, card format B
  (cyan border-top) for media-heavy variants. Don't mix randomly.
- Drop zones: dashed `#1A1A1A` border at rest, solid cyan border on dragover.
- Buttons: primary is cyan bg with `#0F3D45` text. Secondary is dark gray bg
  with white text. Tertiary is text only with cyan on hover.

## Adding a new tool

See `docs/adding-a-tool.md` for the full checklist. Quick version:

1. New folder `apps/web/app/[slug]/`
1. `page.tsx` wraps content in `<ToolShell>`
1. Update landing page tool cards (status from "soon" to "live", set href)
1. Add changelog entry
1. Test on real mobile, not just devtools
1. Run `grep -rn '—' apps packages` and check sentence case
1. PR to `dev`, merge to `main`

## Quality gates before shipping any change

- `pnpm dev` runs without errors
- `pnpm build` completes
- TypeScript strict mode passes
- `grep -rn '—' apps packages` returns zero (em-dashes only banned in user-facing code, see rule 1)
- Mobile responsive at 375px, 768px, 1280px tested
- All Czech diacritics render correctly
- No console errors in browser
- Lighthouse performance >= 90 on touched pages

## Out of scope until explicitly requested

- Auth (Supabase magic link will come in a later phase)
- Analytics (PostHog later)
- Cloudflare Workers, R2, deploy config
- Email backend, share link backend
- Rate limiting
- Public output gallery
- Embed widgets

## Communication style

- Czech for all user-facing copy. English for code, comments, and internal docs.
- Direct and brief. No filler ("In this section we will...").
- Push back if a request is bad or ambiguous. Propose alternatives.
- When done with a task, list what was built, what was decided differently
  from the brief and why, and any blockers.
