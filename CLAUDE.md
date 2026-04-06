# Agent rules for this repo

These rules apply to any AI agent (Claude Code, Cowork, Claude Agent SDK) working in this repository. Read this file first, every session.

## Session start

1. Run `git status` and `git log --oneline -10` before any edits. Trust the repo, not the chat memory.
2. If `HANDOFF.md` exists at the repo root or in `atlas_compliance/`, read it and resume from its **Open Threads** section.

## Editing

3. After any edit batch that touches more than one file or more than ~20 lines, run `git add` + `git commit` with a Conventional Commits message (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`) before responding to the user.
4. Never end a response with uncommitted changes in the working tree. If the user explicitly says "don't commit," acknowledge and skip — but still surface the fact that changes are uncommitted.
5. Prefer many small commits over one large commit. Each commit should be a single logical change.
6. Never use `git add -A` or `git add .` without first running `git status` and confirming nothing sensitive is staged.
7. Never `git push --force`, never amend pushed commits, never skip hooks (`--no-verify`).

## Standards

8. All interactive diagrams follow the canonical tooltip standard in `atlas_compliance/Atlas_Production_Spec.md §4.2`: `<foreignObject>` body, opaque `BG_TOOLTIP` (`#0a0e17`) backing rect at `fill-opacity={1}`, dynamic height from narrative length, `pointerEvents: 'none'`, and canvas `PAD.top`/`PAD.bottom` ≥ tallest expected tooltip + 30px.
9. Coinbase / Catena / Circle / Chainalysis components are always named explicitly in copy and code (e.g. "Coinbase Smart Wallet," "Coinbase CDP x402 facilitator," "Circle USDC," "Chainalysis OFAC").

## Session end

10. If significant work was done, update `HANDOFF.md` (in `atlas_compliance/`) before closing the session. The handoff is the durable record; the chat is not.
