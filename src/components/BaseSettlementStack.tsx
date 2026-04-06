import { useState } from 'preact/hooks';

/**
 * BaseSettlementStack — The settlement-side companion to WalletTerminal.
 *
 * Where WalletTerminal shows compliance depth across WALLET TYPES (the
 * signing side of x402), this diagram shows compliance depth across
 * SETTLEMENT RAILS (the receiving side). The argument:
 *
 *   "x402 isn't just an HTTP convention — the funds traverse a real
 *    architectural stack, and the Coinbase CDP / Base / USDC rail
 *    drives that traversal all the way to L1 Ethereum data
 *    availability, BELOW the STATE line. Off-chain ledgers never
 *    cross the line at all."
 *
 * Companion to:
 *   - WalletTerminal.tsx (signing side, same visual idiom)
 *   - JourneyMap.tsx (the horizontal lifecycle view)
 *
 * Visual conventions match WalletTerminal exactly: same dark BG, same
 * 5-layer L1–L5 grid, same STATE TRANSITION line at the bottom of L3,
 * same ghost-column treatment, same depth badges. The Base Settlement
 * Rail is the highlighted column.
 *
 * Note (atlas-diagram convention): Per the published Two-Model System
 * spec, Stack Diagrams should be on white background with muted-register
 * colors. We deliberately match WalletTerminal's dark/full register for
 * intra-page visual consistency on stable402.com. The convention sweep
 * is tracked as a separate cleanup task across all StablecoinAtlas
 * properties.
 */

// ── Domain colors (T1–T7) — same constants as WalletTerminal ──
const DOMAIN_COLORS = {
  t1: '#34D399', // Token & Chain
  t2: '#FBBF24', // Reserves & Vaults
  t3: '#FB923C', // Account & Execution
  t4: '#A78BFA', // Introspection & Discovery
  t5: '#2DD4BF', // Cross-Chain Transfer
  t6: '#60A5FA', // Identity & Credentials
  t7: '#FB7185', // Travel Rule & Filing
  neutral: '#64748B',
};

// ── Structural colors ──
const BG = '#0a0e17';
const CARD_BG = '#111827';
const GRID = '#2a3040';
const LABEL_DIM = '#6b7280';
const LABEL_MID = '#9ca3af';
const LABEL_BRIGHT = '#f9fafb';

// ── Geometry ──
const W = 860;
const H = 460;
const PAD = { top: 52, right: 30, bottom: 80, left: 90 };

// Layer positions (L5 at top, L1 at bottom) — IDENTICAL to WalletTerminal
const LAYERS = [
  { id: 'L5', name: 'Application', y: PAD.top },
  { id: 'L4', name: 'Middleware', y: PAD.top + 72 },
  { id: 'L3', name: 'Execution', y: PAD.top + 144 },
  { id: 'L2', name: 'Consensus', y: PAD.top + 216 },
  { id: 'L1', name: 'Network', y: PAD.top + 288 },
];

const LAYER_H = 56;

// Settlement rail and its compliance blocks
interface ComplianceBlock {
  label: string;
  layer: number; // 0=L5, 1=L4, 2=L3, 3=L2, 4=L1
  color: string;
  enforcement: 'code' | 'policy';
  detail: string;
}

interface SettlementRail {
  id: string;
  name: string;
  depth: string; // Deepest layer reached
  blocks: ComplianceBlock[];
}

const SETTLEMENT_RAILS: SettlementRail[] = [
  {
    id: 'offchain',
    name: 'Off-chain Ledger',
    depth: 'L4',
    blocks: [
      { label: 'API Receipt', layer: 0, color: DOMAIN_COLORS.neutral, enforcement: 'policy', detail: 'JSON receipt — no on-chain trace' },
      { label: 'PSP Ledger', layer: 1, color: DOMAIN_COLORS.t7, enforcement: 'policy', detail: 'Stripe / PayPal-style internal ledger entry — fully reversible by the operator' },
    ],
  },
  {
    id: 'base',
    name: 'Base Settlement Rail',
    depth: 'L1',
    blocks: [
      { label: 'HTTP 200 + PDF', layer: 0, color: DOMAIN_COLORS.t1, enforcement: 'code', detail: 'StableKYA Worker returns 200 OK with the compliance report PDF body — the HTTP-side delivery half of the atomic exchange' },
      { label: 'Coinbase CDP', layer: 1, color: DOMAIN_COLORS.t7, enforcement: 'code', detail: 'Coinbase CDP x402 facilitator: verifies EIP-3009 signature, runs Chainalysis OFAC screening, then submits the transfer — code-enforced gate before state change' },
      { label: 'USDC EIP-3009', layer: 2, color: DOMAIN_COLORS.t3, enforcement: 'code', detail: 'Circle USDC ERC-20 contract on Base Sepolia — transferWithAuthorization() consumes the signed nonce and moves funds. EVM bytecode, unbypassable.' },
      { label: 'Base OP-Stack', layer: 3, color: DOMAIN_COLORS.t5, enforcement: 'code', detail: 'Base L2 OP-Stack rollup — sequencer orders the transaction, soft finality in ~2s, hard finality on Ethereum after batch posting' },
      { label: 'Ethereum DA', layer: 4, color: DOMAIN_COLORS.t1, enforcement: 'code', detail: 'Calldata + state root posted to Ethereum L1 — data availability and final settlement guarantees inherited from Ethereum' },
    ],
  },
  {
    id: 'l1direct',
    name: 'Ethereum L1 Direct',
    depth: 'L2',
    blocks: [
      { label: 'HTTP 200', layer: 0, color: DOMAIN_COLORS.neutral, enforcement: 'policy', detail: 'Resource delivered after on-chain confirmation — ~12s block times' },
      { label: 'ERC-20 transfer', layer: 1, color: DOMAIN_COLORS.t3, enforcement: 'policy', detail: 'Standard ERC-20 transfer — no built-in authorization scheme, requires prior approve()' },
      { label: 'EOA tx', layer: 2, color: DOMAIN_COLORS.t3, enforcement: 'code', detail: 'Externally-owned account submits the transfer directly — payer pays gas' },
      { label: 'Ethereum PoS', layer: 3, color: DOMAIN_COLORS.t5, enforcement: 'code', detail: 'Ethereum proof-of-stake consensus — finality at L1, ~12 minute economic finality' },
    ],
  },
];

// Column positions — three wide columns centered in the available width
const COL_W = 200;
const COL_GAP = 24;
const COLS_TOTAL = SETTLEMENT_RAILS.length * COL_W + (SETTLEMENT_RAILS.length - 1) * COL_GAP;
const AVAILABLE = W - PAD.left - PAD.right;
const COLS_START = PAD.left + (AVAILABLE - COLS_TOTAL) / 2;
function colX(i: number): number {
  return COLS_START + i * (COL_W + COL_GAP);
}

// The "settled via" column is index 1 (Base Settlement Rail)
const SETTLED_IDX = 1;

export interface BaseSettlementStackProps {
  highlightedRail?: string;
}

export function BaseSettlementStack({ highlightedRail = 'base' }: BaseSettlementStackProps) {
  const [hoveredBlock, setHoveredBlock] = useState<{ railIdx: number; blockIdx: number } | null>(null);

  return (
    <div style={{
      width: '100%',
      maxWidth: `${W}px`,
      margin: '0 auto',
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto' }}
        role="img"
        aria-label="Base settlement stack: settlement depth across three rails, highlighting Coinbase CDP + Base + USDC reaching L1 Ethereum DA"
      >
        {/* Background */}
        <rect x={0} y={0} width={W} height={H} fill={BG} rx={4} />

        {/* Layer labels and horizontal gridlines */}
        {LAYERS.map((layer) => (
          <g key={layer.id}>
            <line
              x1={PAD.left - 5} y1={layer.y}
              x2={W - PAD.right} y2={layer.y}
              stroke={GRID}
              stroke-dasharray="2 5"
            />
            <text
              x={PAD.left - 10}
              y={layer.y + LAYER_H / 2 + 3}
              text-anchor="end"
              fill={LABEL_DIM}
              font-size={10}
              font-family="'IBM Plex Mono', monospace"
            >
              {layer.id}
            </text>
            <text
              x={PAD.left - 10}
              y={layer.y + LAYER_H / 2 + 15}
              text-anchor="end"
              fill={LABEL_DIM}
              font-size={8}
              font-family="'IBM Plex Sans', sans-serif"
              opacity={0.85}
            >
              {layer.name}
            </text>
          </g>
        ))}

        {/* ── STATE TRANSITION LINE — identical treatment to WalletTerminal ── */}
        <line
          x1={PAD.left - 5} y1={LAYERS[2].y + LAYER_H}
          x2={W - PAD.right} y2={LAYERS[2].y + LAYER_H}
          stroke="#f43f5e"
          stroke-width={2.5}
          stroke-opacity={0.95}
          stroke-dasharray="8 4"
        />
        <g>
          <rect
            x={PAD.left - 6}
            y={LAYERS[2].y + LAYER_H - 9}
            width={170}
            height={18}
            rx={3}
            fill="#0a0e17"
            stroke="#f43f5e"
            stroke-width={1}
          />
          <text
            x={PAD.left + 2}
            y={LAYERS[2].y + LAYER_H + 4}
            fill="#f43f5e"
            font-size={9}
            font-weight={700}
            font-family="'IBM Plex Mono', monospace"
            letter-spacing="0.06em"
          >
            ▲ STATE TRANSITION
          </text>
        </g>
        <text
          x={W / 2}
          y={H - 28}
          text-anchor="middle"
          fill="#f43f5e"
          font-size={10}
          font-family="'IBM Plex Mono', monospace"
          opacity={0.95}
        >
          ▲ Above: policy-enforced (off-chain).  ▼ At or below: code-enforced (EVM bytecode, unbypassable).
        </text>

        {/* Settlement rail columns */}
        {SETTLEMENT_RAILS.map((rail, rIdx) => {
          const isSettled = rIdx === SETTLED_IDX;
          const ghostOpacity = isSettled ? 1 : 0.45;
          const cx = colX(rIdx);

          return (
            <g key={rail.id} opacity={ghostOpacity}>
              {/* Column header */}
              <text
                x={cx + COL_W / 2}
                y={PAD.top - 20}
                text-anchor="middle"
                fill={isSettled ? '#fbbf24' : LABEL_MID}
                font-size={isSettled ? 11 : 10}
                font-weight={isSettled ? 700 : 400}
                font-family="'IBM Plex Mono', monospace"
              >
                {rail.name}
              </text>

              {/* "SETTLED VIA" badge for the highlighted rail */}
              {isSettled && (
                <g>
                  <rect
                    x={cx + COL_W / 2 - 42}
                    y={PAD.top - 40}
                    width={84} height={14}
                    rx={3}
                    fill="#fbbf24"
                    fill-opacity={0.15}
                    stroke="#fbbf24"
                    stroke-width={0.5}
                    stroke-opacity={0.5}
                  />
                  <text
                    x={cx + COL_W / 2}
                    y={PAD.top - 30}
                    text-anchor="middle"
                    fill="#fbbf24"
                    font-size={7}
                    font-weight={700}
                    font-family="'IBM Plex Mono', monospace"
                    letter-spacing="0.1em"
                  >
                    SETTLED VIA
                  </text>
                </g>
              )}

              {/* Depth indicator bar (left side of column) */}
              {(() => {
                const maxBlock = rail.blocks.reduce((max, b) => Math.max(max, b.layer), 0);
                const barTop = LAYERS[0].y;
                const barBottom = LAYERS[maxBlock].y + LAYER_H;
                return (
                  <rect
                    x={cx - 4}
                    y={barTop}
                    width={3}
                    height={barBottom - barTop}
                    rx={1.5}
                    fill={isSettled ? '#fbbf24' : LABEL_DIM}
                    fill-opacity={isSettled ? 0.6 : 0.3}
                  />
                );
              })()}

              {/* Compliance blocks */}
              {rail.blocks.map((block, bIdx) => {
                const layer = LAYERS[block.layer];
                const isHov = isSettled && hoveredBlock?.railIdx === rIdx && hoveredBlock?.blockIdx === bIdx;
                const isDashed = block.enforcement === 'policy';

                return (
                  <g key={`${rail.id}-${bIdx}`}>
                    <rect
                      x={cx + 2}
                      y={layer.y + 4}
                      width={COL_W - 4}
                      height={LAYER_H - 8}
                      rx={4}
                      fill={block.color}
                      fill-opacity={isHov ? 0.3 : 0.18}
                      stroke={block.color}
                      stroke-width={isDashed ? 1.5 : 2}
                      stroke-opacity={isHov ? 0.95 : 0.7}
                      stroke-dasharray={isDashed ? '5 3' : 'none'}
                    />
                    <text
                      x={cx + COL_W / 2}
                      y={layer.y + LAYER_H / 2 + 1}
                      text-anchor="middle"
                      fill={block.color}
                      font-size={10}
                      font-weight={600}
                      font-family="'IBM Plex Mono', monospace"
                    >
                      {block.label}
                    </text>

                    {/* Enforcement marker */}
                    <circle
                      cx={cx + COL_W - 12}
                      cy={layer.y + 12}
                      r={3}
                      fill={isDashed ? 'none' : block.color}
                      fill-opacity={0.6}
                      stroke={block.color}
                      stroke-width={1}
                      stroke-opacity={0.5}
                      stroke-dasharray={isDashed ? '2 1' : 'none'}
                    />

                    {/* Hover target (highlighted column only) */}
                    {isSettled && (
                      <rect
                        x={cx + 2}
                        y={layer.y + 4}
                        width={COL_W - 4}
                        height={LAYER_H - 8}
                        fill="transparent"
                        onMouseEnter={() => setHoveredBlock({ railIdx: rIdx, blockIdx: bIdx })}
                        onMouseLeave={() => setHoveredBlock(null)}
                        style={{ cursor: 'pointer' }}
                      />
                    )}

                    {/* Tooltip — render to the LEFT of the column for the
                        rightmost rail, otherwise to the right. The Base
                        column is in the middle so we always go right. */}
                    {isHov && (
                      <g style={{ pointerEvents: 'none' }}>
                        <rect
                          x={cx + COL_W + 8}
                          y={layer.y + 2}
                          width={240}
                          height={LAYER_H - 4}
                          rx={4}
                          fill="#0a0e17"
                          fill-opacity={1}
                          stroke={block.color}
                          stroke-width={1}
                          stroke-opacity={0.85}
                        />
                        <foreignObject
                          x={cx + COL_W + 8}
                          y={layer.y + 2}
                          width={240}
                          height={LAYER_H - 4}
                        >
                          <div
                            xmlns="http://www.w3.org/1999/xhtml"
                            style={{
                              boxSizing: 'border-box',
                              width: '100%',
                              height: '100%',
                              padding: '6px 10px',
                              background: '#0a0e17',
                              fontFamily: "'IBM Plex Sans', sans-serif",
                              overflow: 'hidden',
                            }}
                          >
                            <div style={{
                              color: block.color,
                              fontSize: '9px',
                              fontWeight: 600,
                              fontFamily: "'IBM Plex Mono', monospace",
                              marginBottom: '3px',
                            }}>
                              {block.label} — {block.enforcement === 'code' ? 'Code-enforced' : 'Policy-enforced'}
                            </div>
                            <div style={{
                              color: LABEL_MID,
                              fontSize: '8.5px',
                              lineHeight: 1.35,
                              wordWrap: 'break-word',
                            }}>
                              {block.detail}
                            </div>
                          </div>
                        </foreignObject>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Depth badge at bottom */}
              <g>
                <rect
                  x={cx + COL_W / 2 - 16}
                  y={H - PAD.bottom + 2}
                  width={32} height={16}
                  rx={3}
                  fill={isSettled ? '#fbbf24' : LABEL_DIM}
                  fill-opacity={isSettled ? 0.2 : 0.1}
                  stroke={isSettled ? '#fbbf24' : LABEL_DIM}
                  stroke-width={0.5}
                  stroke-opacity={0.4}
                />
                <text
                  x={cx + COL_W / 2}
                  y={H - PAD.bottom + 14}
                  text-anchor="middle"
                  fill={isSettled ? '#fbbf24' : LABEL_DIM}
                  font-size={9}
                  font-weight={600}
                  font-family="'IBM Plex Mono', monospace"
                >
                  {rail.depth}
                </text>
              </g>
            </g>
          );
        })}

        {/* Legend */}
        <g>
          <circle cx={W - 160} cy={H - 12} r={3} fill="#fbbf24" fill-opacity={0.6} stroke="#fbbf24" stroke-width={1} />
          <text x={W - 152} y={H - 9} fill={LABEL_DIM} font-size={8} font-family="'IBM Plex Sans', sans-serif">
            Code-enforced
          </text>
          <circle cx={W - 80} cy={H - 12} r={3} fill="none" stroke="#fbbf24" stroke-width={1} stroke-dasharray="2 1" />
          <text x={W - 72} y={H - 9} fill={LABEL_DIM} font-size={8} font-family="'IBM Plex Sans', sans-serif">
            Policy-enforced
          </text>
        </g>
      </svg>
    </div>
  );
}

export default BaseSettlementStack;
