# Agent rules for this repo

These rules apply to any AI agent (Claude Code, Cowork, Claude Agent SDK) working in this repository. Read this file first, every session.

## Session start

1. Read `../atlas_compliance/STRATEGY.md` first, then `../atlas_compliance/HANDOFF.md`. Strategy is the durable "why and what"; handoff is the ephemeral "where we are right now." Read strategy first so the handoff gets interpreted through the strategic lens.
2. Run `git status` and `git log --oneline -10` in both the current site repo AND `../atlas_compliance/` before any edits — **host agents only** (Claude Code, plain terminal). Inside the Cowork sandbox, git is unavailable; skip this step and trust the working tree + chat context instead.
3. Resume from the **Open Threads** section of `HANDOFF.md` unless the user explicitly redirects.

With these three steps done automatically, the user's session-opener prompt can shrink to just: *"Continue from HANDOFF Open Threads. We're working on X."*

## Git & commits

This repo uses a separate git directory (`~/.gitdirs/stable402.com`) that lives outside the Cowork sandbox mount. That split is load-bearing — it is what prevents the stale `.git/index.lock` failures that used to plague sandbox commits. The rules below are binding:

3. **Inside the Cowork sandbox**, git is unavailable — even read-only commands like `git status` and `git log` will fail because `.git` is a pointer file resolving to a host path the sandbox cannot see. Do not attempt git from the sandbox. Stage edits via Read/Write/Edit only; at the end of each edit batch, surface a suggested Conventional Commits message in chat for the human to run on the host.
4. **On the host** (Claude Code, plain terminal), git works normally. After any edit batch that touches more than one file or more than ~20 lines, run `git add` + `git commit` with a Conventional Commits message (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`). Prefer many small commits over one large commit.
5. **Never** run git write commands from the sandbox — no `git add`, `git commit`, `git rebase`, `git merge`, `git reset`, `git stash`, `git checkout -b`, `git push`, `git pull`, `git tag`, or anything that touches `.git/`.
6. Never use `git add -A` or `git add .` without first running `git status` and confirming nothing sensitive is staged. Never `git push --force`, never amend pushed commits, never skip hooks (`--no-verify`).
7. Never end a host-side response with uncommitted changes in the working tree. In the sandbox, always surface the suggested commit message instead.

## Standards

8. All interactive diagrams follow the canonical tooltip standard in `atlas_compliance/Atlas_Production_Spec.md §4.2`: `<foreignObject>` body, opaque `BG_TOOLTIP` (`#0a0e17`) backing rect at `fill-opacity={1}`, dynamic height from narrative length, `pointerEvents: 'none'`, and canvas `PAD.top`/`PAD.bottom` ≥ tallest expected tooltip + 30px.
9. Coinbase / Catena / Circle / Chainalysis components are always named explicitly in copy and code (e.g. "Coinbase Smart Wallet," "Coinbase CDP x402 facilitator," "Circle USDC," "Chainalysis OFAC").

## Session end

10. If significant work was done, update `HANDOFF.md` (in `atlas_compliance/`) before closing the session. The handoff is the durable record; the chat is not.
