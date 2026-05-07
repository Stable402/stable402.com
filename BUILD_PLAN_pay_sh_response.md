# Stable402.com — pay.sh Response Build Plan

**Created:** 2026-05-07
**Trigger:** pay.sh launch (Solana Foundation + Google Cloud, 2026-05-05) materially changes x402's industry posture. Stable402 needs to ship a pay.sh-aware content layer in the next 7–14 days while the news cycle still belongs to this story.
**Owner:** Leo (sole builder)
**Working agent:** Claude (Cowork). Sandbox cannot run git; host (Claude Code or plain terminal) runs the copy-paste commit blocks at each phase boundary.

---

## Outcome (what "done" looks like)

After this plan ships, a Coinbase / Catena Labs / Circle / Cloudflare / Stripe-Bridge program lead can land on Stable402.com, see that we are the canonical *compliance-aware, multi-chain* x402 reference (with pay.sh as a named complement), and click through to a forwardable per-vendor sponsor landing in under 60 seconds. The compliance gap that pay.sh leaves blank is the load-bearing artifact in every conversation.

Concretely, the site grows from 3 pages (`/`, `/about`, `/cloudflare`) to ~10 pages organized as:

- **Demo surface** — `/` (live demo, lightly updated)
- **Reference surface** — `/pay-sh`, `/compliance-gap`, `/multi-chain`, `/agents`
- **Sponsor surface** — `/cloudflare` (existing), `/coinbase`, `/circle`, `/catena`, `/bridge`, `/paxos`
- **Editorial surface** — `/about` (lightly updated), `/notes` (Phase C)

---

## Voice and conventions reminder

Carry forward from `CLAUDE.md` and the existing `/cloudflare` page — these are non-negotiable on every new page:

- **Declarative, named-vendor.** "Coinbase Smart Wallet," "Coinbase CDP x402 facilitator," "Circle USDC," "Chainalysis OFAC oracle," "Solana Foundation," "Google Cloud" — never "a wallet provider," never "a screening service."
- **No fluff, no emoji.** Compliance content as substrate, not as feature.
- **Honesty markers** where build state lags rhetoric (see `/cloudflare` hero for the canonical pattern).
- **Tooltip standard** — `<foreignObject>` body, opaque `BG_TOOLTIP` (`#0a0e17`) backing rect at `fill-opacity={1}`, dynamic height, `pointerEvents:'none'`, canvas `PAD.top`/`PAD.bottom` ≥ tallest expected tooltip + 30px. Per `atlas_compliance/Atlas_Production_Spec.md §4.2`.
- **Conventional Commits** — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`. Many small commits, never `git add -A`.
- **Mirror x402 vocabulary** — `facilitator`, `challenge`, `payment proof`, `402`. pay.sh uses these in the canonical Coinbase sense; we align, not fork.

---

## Git workflow for this plan

Per the repo's CLAUDE.md and Leo's git-workflow rule:

- Sandbox-side (Cowork): all edits go through Read/Write/Edit. **No git commands from the sandbox** — `.git` is a pointer file the sandbox cannot resolve. The git directory lives at `~/.gitdirs/stable402.com` on the host.
- Host-side (Claude Code or plain terminal at `~/Projects/WebDev/stable402/stable402.com`): every phase boundary in this plan ends with a **copy-paste commit block**. Specific paths only; never `git add -A` or `git add .`.
- One commit per phase boundary is the target cadence. Small follow-up tweaks within the same day can roll into the next phase's commit.
- Branch: stay on the default branch unless explicitly told otherwise. Cloudflare auto-deploy reads from main on push.

If a phase is interrupted partway through, leave the working tree dirty and commit only what is finished — the unfinished half rolls into the next phase's commit block.

---

## Phase A — Ship within 7 days

The two pages in this phase do most of the strategic work. If only Phase A ever ships, the project is materially better positioned than it was on 2026-05-04.

### A1. `/pay-sh` — pay.sh analysis and positioning page

**File:** `src/pages/pay-sh.astro`
**Pattern:** Mirror `/cloudflare` structure (hero with eyebrow + honesty marker, then 5 numbered sections, then who-is-building + links-out).
**Title:** "x402 in production: pay.sh, Google Cloud, and the Solana reference implementation."

**Section breakdown:**

1. **What pay.sh is** — One paragraph plain description. Names: Solana Foundation, Google Cloud, launch date (2026-05-05), the 8 named launch facilitators (PayAI, Crossmint, Merit Systems, Corbits, MoonPay, Sponge Wallet, ATXP, Tektonic), the AI clients listed (Gemini, Claude Code, Codex, Openclaw, Hermes), and the four catalog buckets (eCommerce, Data & intelligence, Communications, Solana Infrastructure).
2. **The protocol posture** — Quote pay.sh's own framing: built on x402 + MPP, both treated as "machine-native payment protocols." Frame x402 as the cross-chain HTTP standard, MPP as the Solana-native sibling. Vocabulary alignment paragraph (facilitator, challenge, proof). Cite that Google Cloud is hosting and shipping Gemini/Vertex/BigQuery as x402-payable endpoints — "the largest enterprise endorsement x402 has received to date."
3. **What's named vs left blank** — Two-column visual or tight prose. **Named:** wallet-as-account-substitute, gateway-managed rate limits, fiat-out settlement to providers. **Left blank in pay.sh's announcement and `/docs`:** Travel Rule, MSB designation for the fiat leg, OFAC screening for agent wallets, sanctioned-counterparty handling, identity-of-the-regulated-counterparty. This is the moat paragraph. Link forward to `/compliance-gap`.
4. **Stable402's role next to pay.sh** — One paragraph each on (a) Stable402 as the multi-chain x402 reference (pay.sh is Solana-only; x402 is HTTP-native and chain-agnostic), (b) Stable402 as the compliance-aware companion (pay.sh's compliance section is one sentence; Stable402 ships a full gap-map), (c) StablecoinAtlas as the deeper reference layer agents will read while transacting.
5. **Link cards out** — pay.sh, the Solana announcement, x402.org, `/compliance-gap`, `/cloudflare`, the Atlas. Same `link-card` pattern as the index page Section 5.

**Copy sources:** Use only the verbatim quotes captured in the 2026-05-07 pay.sh intelligence brief (in chat). Do not paraphrase pay.sh's marketing.
**Nav update:** Add `pay.sh` between `Demo` and `About` in `src/layouts/Main.astro`.
**Tooltip standard:** None on this page — it's a content page, no diagrams that need tooltips. If a small SVG is added (e.g., a x402+MPP relationship diagram), apply the tooltip standard per CLAUDE.md.
**Honesty marker:** Not required for `/pay-sh` (we are commenting on someone else's launch, not claiming a build state).

### A2. `/compliance-gap` — the moat page

**File:** `src/pages/compliance-gap.astro`
**Title:** "The compliance layer x402 doesn't ship with."

This is the highest-leverage page in the entire plan. It is what gets sent to Catena Labs, Circle, and Bridge.

**Section breakdown:**

1. **Hero** — One sharp sentence: x402 specifies the protocol; the regulated counterparty layer is unspecified by design, and pay.sh demonstrates this gap at scale.
2. **The four-leg flow diagram** — SVG, same visual language as the `/cloudflare` architecture diagram. Four nodes left to right: **Agent wallet → Facilitator → API provider → Fiat-out leg**. Each node has a coloured "regulatory question" label below it: who screens the wallet, who keeps the Travel Rule record, who is the regulated counterparty for the resource provider's revenue, who is the MSB on the fiat-out leg.
3. **Each leg, in detail** — Four short subsections, each with: (a) the question, (b) what x402 says, (c) what pay.sh says (often: nothing), (d) what a compliance-aware implementation would name. Reference the relevant Atlas tools where they exist (e.g., link to the Chainalysis Sanctions Checker tool on the Atlas, link to StableKYA for KYA depth).
4. **What Stable402 contributes** — Half a page. We are not claiming to be the regulated counterparty; we are claiming to be the public reference that names where the questions live and points at who can answer them.
5. **Who should read this** — Three short paragraphs targeting (a) compliance officers at issuers, (b) program leads at Coinbase / Catena / Circle / Bridge, (c) acquirers doing due diligence on the agent-payments space.
6. **Links out** — `/pay-sh`, x402.org, the Atlas, StableKYA, AtomicDvP, plus an explicit "contact" CTA to leo@stableclarity.com.

**Diagram requirements:** SVG must follow the canonical tooltip standard if hover content is added. If shipping without tooltips in the first cut, that is acceptable — flag the tooltip upgrade in a `<!-- TODO: -->` comment in-source.

### A3. Light edits to existing pages

`src/pages/index.astro`:
- Above the existing hero `<h1>`, add a slim notice strip: "Now adopted by Solana Foundation + Google Cloud (pay.sh, May 2026). Read our analysis →" linking `/pay-sh`. Match the eyebrow styling from `/cloudflare`'s `cf-eyebrow` class but in a banner shape.
- In Section 5's `links-out`, add a fifth `link-card` for pay.sh.

`src/pages/about.astro`:
- After the existing third paragraph ("The reference lives on the Atlas. The proof lives here."), add one paragraph: "x402 is no longer a single-vendor protocol. Coinbase shipped the spec; Cloudflare ships facilitator infrastructure; Solana Foundation and Google Cloud now ship pay.sh on it. Stable402 is the chain-agnostic, compliance-aware reference that sits alongside all of them."

`src/layouts/Main.astro`:
- Nav update: add `<a href="/pay-sh">pay.sh</a>` between `Demo` and `About`.
- Footer: add `· <a href="/compliance-gap">Compliance gap</a>` after the existing Cloudflare link.

### A4. Phase A commit block

Run from host terminal at `~/Projects/WebDev/stable402/stable402.com`:

```bash
# Phase A — pay.sh response, ships /pay-sh + /compliance-gap + light edits
git add src/pages/pay-sh.astro src/pages/compliance-gap.astro
git add src/pages/index.astro src/pages/about.astro src/layouts/Main.astro
git add BUILD_PLAN_pay_sh_response.md
git commit -m "feat: add /pay-sh and /compliance-gap; surface pay.sh in nav and home"
git push
```

If only one of the two new pages is finished, split into two commits:

```bash
# If only /pay-sh is ready
git add src/pages/pay-sh.astro src/layouts/Main.astro src/pages/index.astro src/pages/about.astro
git commit -m "feat: add /pay-sh page and surface in nav, home, about"
git push
```

```bash
# Then later when /compliance-gap is ready
git add src/pages/compliance-gap.astro src/layouts/Main.astro
git commit -m "feat: add /compliance-gap page and link from footer"
git push
```

---

## Phase B — Ship within 14 days of Phase A

Three pages plus a sponsor-landing cohort of five. Phase B's job is to convert Phase A's positioning into concrete forwardable URLs for outreach.

### B1. `/agents` — AI client × x402 surface coverage

**File:** `src/pages/agents.astro`
**Title:** "Which agents speak x402, today."

A single-table-driven page. The table has rows = AI clients (Claude Code, Codex, Gemini, Hermes, Openclaw, plus any Coinbase/CDP-side agent runtimes), columns = (Surface: CLI / MCP / hosted, Facilitator: Coinbase CDP / pay.sh gateway / Cloudflare, Chains supported, Stablecoins supported, Notes). Beneath the table, three short paragraphs framing what's missing (most agents do not have native x402 support; they go through a wrapper like `pay` from pay.sh or Coinbase's CDP SDK).

This page is what a fintech dev-program lead skims for in 30 seconds. Keep it operational, not editorial.

### B2. `/multi-chain` — x402 footprint map

**File:** `src/pages/multi-chain.astro`
**Title:** "x402 across the rails."

A single SVG map: x402 footprint across **EVM** (Coinbase CDP facilitator), **Base** (the live demo), **Solana** (via pay.sh + MPP), **Arc** (Circle's L2), **Tempo** (Stripe's chain), and any others active by the time this ships. Each chain is a node; each is annotated with: facilitator, native stablecoin, settlement time, who is the named compliance counterparty.

Pure positioning play — Stable402 is the only place a CTO can see the whole footprint at once. Cross-link each chain node to the corresponding Atlas rail page.

Tooltip standard applies if the SVG nodes have hover content.

### B3. Sponsor-landing cohort

Clone `/cloudflare` into five vendor-specific landings. The `/cloudflare` page is the canonical structure; each new page follows it section-for-section, with vendor-specific naming and asks.

**Files:**
- `src/pages/coinbase.astro` — Coinbase CDP, x402 spec authorship, AgentKit integration, Smart Wallet
- `src/pages/circle.astro` — USDC, Arc L2, Travel Rule overlay, CCTP
- `src/pages/catena.astro` — agent-payments-as-regulated-counterparty thesis
- `src/pages/bridge.astro` — fiat-out leg, MSB-as-a-service
- `src/pages/paxos.astro` — regulated stablecoin issuer angle

Each page has the same six-section shape as `/cloudflare`: hero with honesty marker, what runs on/with the vendor today, end-to-end architecture, the substantive code or diagram excerpt, three "why this matters to [vendor]" reasons, three asks tiered lightweight / mid / heavyweight, who is building it.

**Voice rule for each:** the asks must be vendor-specific and credible — do not copy-paste Cloudflare's "credits + Launchpad" asks into the Coinbase page. Coinbase does not ship Workers credits. Calibrate each ask to what the vendor actually has to offer.

The Coinbase page is the highest priority of the five — write it first. The others can ship over the following week as time allows.

### B4. Nav and footer updates

`src/layouts/Main.astro`:
- Nav grows to: `Demo · pay.sh · Multi-chain · Agents · About`. The five sponsor landings stay off the public nav (they are forwardable URLs, not public destinations) but get a small "For program leads" footer block listing them.

### B5. Phase B commit block

Phase B is large enough to warrant per-page commits, not a single batch. Run each as the corresponding page is finished:

```bash
# Each new page
git add src/pages/agents.astro
git commit -m "feat: add /agents AI client x402 coverage table"
git push

git add src/pages/multi-chain.astro
git commit -m "feat: add /multi-chain x402 footprint map"
git push

git add src/pages/coinbase.astro
git commit -m "feat: add /coinbase sponsor landing"
git push

git add src/pages/circle.astro
git commit -m "feat: add /circle sponsor landing"
git push

git add src/pages/catena.astro
git commit -m "feat: add /catena sponsor landing"
git push

git add src/pages/bridge.astro
git commit -m "feat: add /bridge sponsor landing"
git push

git add src/pages/paxos.astro
git commit -m "feat: add /paxos sponsor landing"
git push
```

Nav and footer changes get folded into whichever per-page commit they accompany — usually the first one (`agents`).

```bash
# Nav + footer update, when ready
git add src/layouts/Main.astro
git commit -m "chore: surface multi-chain, agents, and sponsor landings in nav and footer"
git push
```

---

## Phase C — When time permits

Lower-priority but on-roadmap. Ship in any order, no fixed deadline.

### C1. `/notes` — short-form blog

**File:** `src/pages/notes.astro` (index) and `src/pages/notes/[slug].astro` (per-post)
**Inaugural post:** "pay.sh and the compliance vacuum, May 2026" — a tightened version of the chat-thread analysis from this session.
**Cadence:** One post per material x402 / agent-payments industry event. Two to four posts a month is the target.

This compounds as SEO over months. Not urgent, but cheap once the layout is built.

### C2. `/how-to-read` teaser

A small section pointing to the Atlas's How-to-Read page, since that is the explainer surface that reads Stable402's flows. Slim — the explainer lives on the Atlas, not here. One section, one diagram, one CTA.

### C3. Domain mapping

Per project instructions: map the supplementary domains in `compliance domains/` (in the parent dev folder) to selected pages or page sections of Stable402 and the Atlas. Concrete mapping decisions live in the Atlas plan, not here, but Stable402-specific redirects (e.g., a hypothetical `x402-multichain.com` → `/multi-chain`) are 30-minute Cloudflare redirect rules once the pages exist.

### C4. Phase C commit block

```bash
# Notes index
git add src/pages/notes.astro src/pages/notes/
git commit -m "feat: add /notes blog with inaugural pay.sh post"
git push
```

```bash
# How-to-read teaser
git add src/pages/how-to-read.astro src/layouts/Main.astro
git commit -m "feat: add /how-to-read teaser pointing to Atlas explainer"
git push
```

---

## Open threads / parking lot

These are flagged but not in the critical path:

- **Demo mode vs live x402 gate** — the home page still defaults to demo mode (`window.__x402_demo = true`). The honesty marker on `/cloudflare` covers this, but the gap between rhetoric and live state is widening. Ship the production gate before any sponsor program review. Tracked separately from this plan.
- **MPP reference depth** — pay.sh names MPP as a Solana-native sibling protocol but the full MPP spec is not yet public. Watch for a Solana Foundation MPP spec drop in the next 30 days; if it arrives, refresh `/pay-sh` Section 2 and `/multi-chain`.
- **A2A / AP2 / ACP integration** — not addressed in pay.sh's launch but present in the broader agent-payments standards landscape. Out of scope for this plan; revisit if any of those ship a production reference.
- **MCP-callable surface** — Stable402 itself is not MCP-callable today. The Atlas's MCP endpoint at `mcp.stablecoinatlas.com` is the load-bearing one. Stable402 likely doesn't need its own MCP surface — it is a demo, not a registry — but flag if a sponsor conversation pushes for it.

---

## Status tracker

Update this section in-place as phases complete. Each row should end at "shipped DATE — commit SHA" or "in flight" or "not started."

| Phase | Item | Status |
|---|---|---|
| A1 | `/pay-sh` page | shipped 2026-05-07 (commit: see git log) |
| A2 | `/compliance-gap` page | in flight — drafted 2026-05-07, awaiting commit |
| A3 | Index + about + nav edits | shipped 2026-05-07 (commit: see git log) |
| B1 | `/agents` page | not started |
| B2 | `/multi-chain` page | not started |
| B3 | `/coinbase` sponsor landing | not started |
| B3 | `/circle` sponsor landing | not started |
| B3 | `/catena` sponsor landing | not started |
| B3 | `/bridge` sponsor landing | not started |
| B3 | `/paxos` sponsor landing | not started |
| C1 | `/notes` index + first post | not started |
| C2 | `/how-to-read` teaser | not started |
| C3 | Domain mapping rules | not started |

---

## Initial commit (this plan itself)

Run from host terminal at `~/Projects/WebDev/stable402/stable402.com`:

```bash
git add BUILD_PLAN_pay_sh_response.md
git commit -m "docs: add pay.sh response build plan"
git push
```
