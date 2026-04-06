import { useState } from 'preact/hooks';

/**
 * WalletTerminal — Focused wallet architecture cross-cut diagram.
 *
 * Shows 5 wallet types across 5 stack layers (L5→L1).
 * The connected wallet (Smart Contract Wallet) is full-size and interactive.
 * The other four types are rendered as faded ghosts at 20-30% opacity.
 *
 * Visual argument: "Your wallet has code-enforced compliance at L3.
 * Most wallets don't."
 */

// ── Domain colors (T1–T7) ──
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

// Layer positions (L5 at top, L1 at bottom)
const LAYERS = [
  { id: 'L5', name: 'Application', y: PAD.top },
  { id: 'L4', name: 'Middleware', y: PAD.top + 72 },
  { id: 'L3', name: 'Execution', y: PAD.top + 144 },
  { id: 'L2', name: 'Consensus', y: PAD.top + 216 },
  { id: 'L1', name: 'Network', y: PAD.top + 288 },
];

const LAYER_H = 56;

// Wallet types and their compliance blocks
interface ComplianceBlock {
  label: string;
  layer: number; // 0=L5, 1=L4, 2=L3, 3=L2, 4=L1
  color: string;
  enforcement: 'code' | 'policy';
  detail: string;
}

interface WalletType {
  id: string;
  name: string;
  depth: string; // Deepest compliance layer
  blocks: ComplianceBlock[];
}

const WALLET_TYPES: WalletType[] = [
  {
    id: 'eoa',
    name: 'Self-Custody EOA',
    depth: 'L5',
    blocks: [
      { label: 'Wallet UI', layer: 0, color: DOMAIN_COLORS.neutral, enforcement: 'policy', detail: 'MetaMask / Rainbow — user confirms tx manually' },
    ],
  },
  {
    id: 'smart',
    name: 'Coinbase Smart Wallet',
    depth: 'L3',
    blocks: [
      { label: 'Passkey UI', layer: 0, color: DOMAIN_COLORS.t6, enforcement: 'code', detail: 'WebAuthn passkey on the Coinbase Smart Wallet — biometric identity at L5' },
      { label: 'OFAC / KYT', layer: 1, color: DOMAIN_COLORS.t7, enforcement: 'policy', detail: 'Chainalysis address screening invoked by the Coinbase CDP x402 facilitator — policy-enforced at L4' },
      { label: 'ERC-4337', layer: 2, color: DOMAIN_COLORS.t3, enforcement: 'code', detail: 'validateUserOp on the Coinbase Smart Wallet account contract — session keys, spending limits, transfer hooks' },
    ],
  },
  {
    id: 'mpc',
    name: 'MPC Wallet',
    depth: 'L4',
    blocks: [
      { label: 'KYC Gate', layer: 0, color: DOMAIN_COLORS.t6, enforcement: 'policy', detail: 'Identity verification before key share issuance' },
      { label: 'MPC Threshold', layer: 1, color: DOMAIN_COLORS.t5, enforcement: 'code', detail: 'Threshold signing — 2-of-3 key shares required' },
    ],
  },
  {
    id: 'custodial',
    name: 'Hosted / Custodial',
    depth: 'L4',
    blocks: [
      { label: 'Identity', layer: 0, color: DOMAIN_COLORS.t6, enforcement: 'policy', detail: 'Full KYC — passport, address, source of funds' },
      { label: 'Gas Sponsor', layer: 1, color: DOMAIN_COLORS.t2, enforcement: 'code', detail: 'Exchange sponsors gas — user pays in USDC' },
    ],
  },
  {
    id: 'agent',
    name: 'Agent Wallet',
    depth: 'L3',
    blocks: [
      { label: 'AgentKit', layer: 0, color: DOMAIN_COLORS.t4, enforcement: 'code', detail: 'Coinbase AgentKit (CDP) — autonomous transaction authority for AI agents' },
      { label: 'Spend Policy', layer: 1, color: DOMAIN_COLORS.t2, enforcement: 'code', detail: 'Rate limits, allowlists — code-enforced at L4' },
      { label: 'Session Keys', layer: 2, color: DOMAIN_COLORS.t3, enforcement: 'code', detail: 'ERC-4337 session keys — time-bound, scoped authority' },
    ],
  },
];

// Column positions
const COL_W = 120;
const COL_GAP = 16;
const COLS_START = PAD.left + 20;
function colX(i: number): number {
  return COLS_START + i * (COL_W + COL_GAP);
}

// The "connected" wallet is index 1 (Smart Contract Wallet)
const CONNECTED_IDX = 1;

export interface WalletTerminalProps {
  connectedWalletType?: string;
}

export function WalletTerminal({ connectedWalletType = 'smart' }: WalletTerminalProps) {
  const [hoveredBlock, setHoveredBlock] = useState<{ walletIdx: number; blockIdx: number } | null>(null);

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
        aria-label="Wallet terminal cross-cut: compliance depth across 5 wallet types"
      >
        {/* Background */}
        <rect x={0} y={0} width={W} height={H} fill={BG} rx={4} />

        {/* Layer labels and horizontal gridlines */}
        {LAYERS.map((layer, i) => (
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

        {/* ── STATE TRANSITION LINE ──
            The fundamental boundary of the StablecoinAtlas thesis:
            compliance ABOVE this line is policy-enforced (off-chain,
            bypassable); compliance AT or BELOW this line is
            code-enforced (EVM bytecode, unbypassable). */}
        <line
          x1={PAD.left - 5} y1={LAYERS[2].y + LAYER_H}
          x2={W - PAD.right} y2={LAYERS[2].y + LAYER_H}
          stroke="#f43f5e"
          stroke-width={2.5}
          stroke-opacity={0.95}
          stroke-dasharray="8 4"
        />
        {/* Label badge sitting on the line at the left margin */}
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
        {/* Caption beneath the diagram */}
        <text
          x={W / 2}
          y={H - 28}
          text-anchor="middle"
          fill="#f43f5e"
          font-size={10}
          font-family="'IBM Plex Mono', monospace"
          opacity={0.95}
        >
          ▲ Above the STATE TRANSITION line: policy-enforced (off-chain).  ▼ At or below: code-enforced (EVM bytecode).
        </text>

        {/* Wallet columns */}
        {WALLET_TYPES.map((wallet, wIdx) => {
          const isConnected = wIdx === CONNECTED_IDX;
          const ghostOpacity = isConnected ? 1 : 0.45;
          const cx = colX(wIdx);

          return (
            <g key={wallet.id} opacity={ghostOpacity}>
              {/* Column header */}
              <text
                x={cx + COL_W / 2}
                y={PAD.top - 20}
                text-anchor="middle"
                fill={isConnected ? '#fbbf24' : LABEL_MID}
                font-size={isConnected ? 10 : 9}
                font-weight={isConnected ? 700 : 400}
                font-family="'IBM Plex Mono', monospace"
              >
                {wallet.name}
              </text>

              {/* "YOUR WALLET" badge for connected */}
              {isConnected && (
                <g>
                  <rect
                    x={cx + COL_W / 2 - 40}
                    y={PAD.top - 40}
                    width={80} height={14}
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
                    YOUR WALLET
                  </text>
                </g>
              )}

              {/* Depth indicator bar (left side of column) */}
              {(() => {
                const maxBlock = wallet.blocks.reduce((max, b) => Math.max(max, b.layer), 0);
                const barTop = LAYERS[0].y;
                const barBottom = LAYERS[maxBlock].y + LAYER_H;
                return (
                  <rect
                    x={cx - 4}
                    y={barTop}
                    width={3}
                    height={barBottom - barTop}
                    rx={1.5}
                    fill={isConnected ? '#fbbf24' : LABEL_DIM}
                    fill-opacity={isConnected ? 0.6 : 0.3}
                  />
                );
              })()}

              {/* Compliance blocks */}
              {wallet.blocks.map((block, bIdx) => {
                const layer = LAYERS[block.layer];
                const isHov = isConnected && hoveredBlock?.walletIdx === wIdx && hoveredBlock?.blockIdx === bIdx;
                const isDashed = block.enforcement === 'policy';

                return (
                  <g key={`${wallet.id}-${bIdx}`}>
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
                      font-size={9}
                      font-weight={600}
                      font-family="'IBM Plex Mono', monospace"
                    >
                      {block.label}
                    </text>

                    {/* Enforcement marker */}
                    <circle
                      cx={cx + COL_W - 10}
                      cy={layer.y + 12}
                      r={3}
                      fill={isDashed ? 'none' : block.color}
                      fill-opacity={0.6}
                      stroke={block.color}
                      stroke-width={1}
                      stroke-opacity={0.5}
                      stroke-dasharray={isDashed ? '2 1' : 'none'}
                    />

                    {/* Hover target (connected wallet only) */}
                    {isConnected && (
                      <rect
                        x={cx + 2}
                        y={layer.y + 4}
                        width={COL_W - 4}
                        height={LAYER_H - 8}
                        fill="transparent"
                        onMouseEnter={() => setHoveredBlock({ walletIdx: wIdx, blockIdx: bIdx })}
                        onMouseLeave={() => setHoveredBlock(null)}
                        style={{ cursor: 'pointer' }}
                      />
                    )}

                    {/* Tooltip for hovered block */}
                    {isHov && (
                      <g style={{ pointerEvents: 'none' }}>
                        <rect
                          x={cx + COL_W + 8}
                          y={layer.y + 2}
                          width={232}
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
                          width={232}
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
                  fill={isConnected ? '#fbbf24' : LABEL_DIM}
                  fill-opacity={isConnected ? 0.2 : 0.1}
                  stroke={isConnected ? '#fbbf24' : LABEL_DIM}
                  stroke-width={0.5}
                  stroke-opacity={0.4}
                />
                <text
                  x={cx + COL_W / 2}
                  y={H - PAD.bottom + 14}
                  text-anchor="middle"
                  fill={isConnected ? '#fbbf24' : LABEL_DIM}
                  font-size={9}
                  font-weight={600}
                  font-family="'IBM Plex Mono', monospace"
                >
                  {wallet.depth}
                </text>
              </g>
            </g>
          );
        })}

        {/* Legend */}
        <g>
          <circle cx={W - 160} cy={H - 16} r={3} fill="#fbbf24" fill-opacity={0.6} stroke="#fbbf24" stroke-width={1} />
          <text x={W - 152} y={H - 13} fill={LABEL_DIM} font-size={8} font-family="'IBM Plex Sans', sans-serif">
            Code-enforced
          </text>
          <circle cx={W - 80} cy={H - 16} r={3} fill="none" stroke="#fbbf24" stroke-width={1} stroke-dasharray="2 1" />
          <text x={W - 72} y={H - 13} fill={LABEL_DIM} font-size={8} font-family="'IBM Plex Sans', sans-serif">
            Policy-enforced
          </text>
        </g>
      </svg>
    </div>
  );
}

export default WalletTerminal;
