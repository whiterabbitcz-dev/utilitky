# Adding a tool

Step-by-step checklist for putting a new utility on the platform.

1. Create folder `apps/web/app/[slug]/`.
2. Create `page.tsx` using `ToolShell` with title and subtitle.
3. Implement the tool logic (typically client component with `"use client"`).
4. Update landing page tool cards: change status from `"soon"` to `"live"` with the correct `href`.
5. Add changelog entry under `/changelog`.
6. Test on real mobile (not just devtools).
7. Run grep for em-dashes in user-facing code (`apps packages`), sentence case violations.
8. Open PR to dev branch, review, merge to main.

## House rules (don't skip)

- Sentence case for all titles, subtitles, button labels. CAPS is reserved for micro-tags only.
- No em-dashes in user-facing copy (UI strings, headings, button labels, marketing pages, changelog entries, error messages). Use period, colon, comma, parens, semicolon, or two sentences. Internal tooling, READMEs, code comments, and commit messages can use em-dashes freely.
- Black dominates. Cyan is signal, not decoration.
- Czech diacritics correct. UTF-8 always.
- Brand wordmarks respected (lowercase brands stay lowercase: nutribullet, eBay, iPhone).

## Pre-commit grep

Search for U+2014 (em-dash) in user-facing code only and remove every hit:

```bash
grep -rnP "\x{2014}" apps packages
```

Must return zero results. Internal docs (`docs/`, `tools/*/README.md`), code comments, and commit messages are out of scope and may keep em-dashes.
