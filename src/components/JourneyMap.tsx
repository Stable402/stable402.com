import { useState } from 'preact/hooks';
import type { JourneyConfig, Waypoint } from '../data/journeys';

/**
 * JourneyMap — Configurable protocol journey visualization (Preact).
 *
 * Renders 1–3 protocol traces across the 8 STP stages as pure SVG.
 * Supports compact mode for section-level "you are here" maps.
 */

// ── Stage data ──
const STAGE_NAMES = ['Intent', 'Identity', 'Discovery', 'Negotiation', 'Transport', 'Authorization', 'Facilitation', 'Finality'];
const STAGE_GLYPHS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

// ── Structural colors ──
const BG = '#0a0e17';
const GRID = '#1a1f2a';
const LABEL_DIM = '#4b5563';
const LABEL_MID = '#9ca3af';
const LABEL_BRIGHT = '#f9fafb';

// ── Chart geometry ──
const W = 860;
// Top/bottom padding is generous so hover tooltips (which can grow to
// ~110px tall for long narratives like the Bazaar discovery sentence)
// always render inside the dark background rect.
const PAD = { top: 130, right: 40, bottom: 130, left: 40 };
const PLOT_W = W - PAD.left - PAD.right;
const LANE_H = 60;
const LANE_GAP = 30;

function xPos(i: number): number {
  return PAD.left + (i / 7) * PLOT_W;
}

// ── Checkpoint type data ──
const COMPLIANCE_DATA = [
  { gate: 3, monitor: 1, obligation: 0 },
  { gate: 5, monitor: 2, obligation: 0 },
  { gate: 2, monitor: 1, obligation: 0 },
  { gate: 1, monitor: 3, obligation: 0 },
  { gate: 0, monitor: 2, obligation: 0 },
  { gate: 1, monitor: 2, obligation: 0 },
  { gate: 3, monitor: 4, obligation: 1 },
  { gate: 2, monitor: 1, obligation: 4 },
];

function getCheckpointType(stageIdx: number): 'gate' | 'monitor' | 'obligation' {
  const d = COMPLIANCE_DATA[stageIdx];
  if (!d) return 'gate';
  if (d.gate >= d.monitor && d.gate >= d.obligation) return 'gate';
  if (d.monitor >= d.obligation) return 'monitor';
  return 'obligation';
}

// ── Sub-components ──

function CheckpointShape({ x, y, type, color, size = 5 }: {
  x: number; y: number; type: 'gate' | 'monitor' | 'obligation'; color: string; size?: number;
}) {
  if (type === 'gate') {
    const s = size;
    return (
      <polygon
        points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`}
        fill={color}
        fill-opacity={0.35}
        stroke={color}
        stroke-width={1}
        stroke-opacity={0.6}
      />
    );
  }
  if (type === 'monitor') {
    return (
      <g>
        <circle cx={x} cy={y} r={size} fill="none" stroke={color} stroke-width={1} stroke-opacity={0.6} />
        <path
          d={`M ${x} ${y - size} A ${size} ${size} 0 0 1 ${x} ${y + size} Z`}
          fill={color}
          fill-opacity={0.35}
        />
      </g>
    );
  }
  return (
    <g>
      <circle cx={x} cy={y} r={size} fill="none" stroke={color} stroke-width={1} stroke-opacity={0.6} stroke-dasharray="2 2" />
      <circle cx={x} cy={y} r={2} fill={color} fill-opacity={0.5} />
    </g>
  );
}

function FlowLine({ y, activeSet, color }: {
  y: number; activeSet: Set<number>; color: string;
}) {
  const segments = [];
  for (let i = 0; i < 7; i++) {
    const x1 = xPos(i);
    const x2 = xPos(i + 1);
    const bothActive = activeSet.has(i) && activeSet.has(i + 1);
    const eitherActive = activeSet.has(i) || activeSet.has(i + 1);
    segments.push(
      <line
        key={i}
        x1={x1} y1={y} x2={x2} y2={y}
        stroke={bothActive ? color : eitherActive ? color : '#ffffff'}
        stroke-width={bothActive ? 2.5 : eitherActive ? 2 : 1.5}
        stroke-opacity={bothActive ? 0.85 : eitherActive ? 0.4 : 0.18}
        stroke-linecap="round"
      />
    );
  }
  return <>{segments}</>;
}

function WaypointDot({ x, y, color, isHovered, onEnter, onLeave }: {
  x: number; y: number; color: string; isHovered: boolean;
  onEnter: () => void; onLeave: () => void;
}) {
  return (
    <g>
      {isHovered && (
        <circle cx={x} cy={y} r={18} fill={color} fill-opacity={0.12} />
      )}
      <circle
        cx={x} cy={y}
        r={isHovered ? 8 : 6.5}
        fill={BG}
        stroke={color}
        stroke-width={isHovered ? 2.5 : 2}
      />
      <circle
        cx={x} cy={y}
        r={isHovered ? 4.5 : 3.5}
        fill={color}
      />
      <circle
        cx={x} cy={y} r={18}
        fill="transparent"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{ cursor: 'pointer' }}
      />
    </g>
  );
}

function Tooltip({ x, y, waypoint, color, above, svgWidth }: {
  x: number; y: number; waypoint: Waypoint; color: string; above: boolean; svgWidth: number;
}) {
  const boxW = 280;
  // Estimate height from narrative length so longer waypoints (e.g. the
  // Bazaar discovery sentence) don't overflow.
  const charsPerLine = 42;
  const lines = Math.max(2, Math.ceil(waypoint.narrative.length / charsPerLine));
  const boxH = 24 + lines * 13 + 12;
  const tipY = above ? y - 24 - boxH : y + 24;

  let boxX = x - boxW / 2;
  if (boxX < 8) boxX = 8;
  if (boxX + boxW > svgWidth - 8) boxX = svgWidth - boxW - 8;

  return (
    <g style={{ pointerEvents: 'none' }}>
      <line
        x1={x} y1={y + (above ? -10 : 10)}
        x2={x} y2={tipY + (above ? boxH : 0)}
        stroke={color} stroke-opacity={0.6} stroke-width={1}
      />
      {/* Solid backing rect — fully opaque so underlying flow lines and
          waypoint dots don't bleed through the tooltip. */}
      <rect
        x={boxX} y={tipY}
        width={boxW} height={boxH}
        rx={4}
        fill="#0a0e17"
        fill-opacity={1}
        stroke={color}
        stroke-width={1}
        stroke-opacity={0.85}
      />
      <foreignObject x={boxX} y={tipY} width={boxW} height={boxH}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '100%',
            padding: '8px 12px',
            background: '#0a0e17',
            fontFamily: "'IBM Plex Sans', Inter, sans-serif",
          }}
        >
          <div
            style={{
              color,
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: "'IBM Plex Mono', monospace",
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {waypoint.label}
          </div>
          <div
            style={{
              color: LABEL_MID,
              fontSize: '9.5px',
              lineHeight: 1.4,
              wordWrap: 'break-word',
            }}
          >
            {waypoint.narrative}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

// ── Props ──

export interface JourneyMapProps {
  journeys: JourneyConfig[];
  convergenceZone?: { start: number; end: number; label: string };
  title?: string;
  highlightStages?: number[];
  compact?: boolean;
  dimmed?: boolean;
}

// ── Main component ──

export function JourneyMap({
  journeys,
  convergenceZone,
  title,
  highlightStages,
  compact = false,
  dimmed = false,
}: JourneyMapProps) {
  const [hovered, setHovered] = useState<{ journeyId: string; stage: number } | null>(null);

  const laneCount = journeys.length;
  const laneStart = PAD.top + (title ? 24 : 0);
  const totalLanesH = laneCount * LANE_H + (laneCount - 1) * LANE_GAP;
  const H = compact
    ? laneStart + totalLanesH + 120
    : laneStart + totalLanesH + PAD.bottom;

  function laneY(idx: number): number {
    return laneStart + idx * (LANE_H + LANE_GAP) + LANE_H / 2;
  }

  const journeyMeta = journeys.map((j, idx) => ({
    ...j,
    laneIdx: idx,
    activeSet: new Set(j.waypoints.map(w => w.stage)),
    y: laneY(idx),
  }));

  const containerOpacity = dimmed ? 0.4 : 1;

  return (
    <div style={{
      width: '100%',
      maxWidth: `${W}px`,
      margin: '0 auto',
      fontFamily: "'IBM Plex Mono', monospace",
      opacity: containerOpacity,
    }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto' }}
        role="img"
        aria-label={title || `Protocol journey map: ${journeys.map(j => j.label).join(', ')}`}
      >
        {/* Background */}
        <rect x={0} y={0} width={W} height={H} fill={BG} rx={4} />

        {/* Title */}
        {title && (
          <text
            x={W / 2} y={PAD.top - 4}
            text-anchor="middle"
            fill={LABEL_BRIGHT}
            font-size={12}
            font-weight={600}
            font-family="'IBM Plex Mono', monospace"
            letter-spacing="0.06em"
          >
            {title.toUpperCase()}
          </text>
        )}

        {/* Vertical stage gridlines */}
        {STAGE_NAMES.map((_, i) => (
          <line
            key={`grid-${i}`}
            x1={xPos(i)} y1={laneStart - 8}
            x2={xPos(i)} y2={laneStart + totalLanesH + 8}
            stroke={GRID}
            stroke-dasharray="2 5"
          />
        ))}

        {/* Highlight stages ("you are here" marker) — a SINGLE bounding box
            spanning all highlighted stages, with one label centered above. */}
        {highlightStages && highlightStages.length > 0 && (() => {
          const minS = Math.min(...highlightStages);
          const maxS = Math.max(...highlightStages);
          const x1 = xPos(minS) - 16;
          const x2 = xPos(maxS) + 16;
          return (
            <g key="hl-group">
              <rect
                x={x1}
                y={laneStart - 12}
                width={x2 - x1}
                height={totalLanesH + 24}
                rx={4}
                fill="#fbbf24"
                fill-opacity={0.08}
                stroke="#fbbf24"
                stroke-opacity={0.3}
                stroke-width={1}
                stroke-dasharray="3 3"
              />
              <text
                x={(x1 + x2) / 2}
                y={laneStart - 18}
                text-anchor="middle"
                fill="#fbbf24"
                fill-opacity={0.7}
                font-size={8}
                font-weight={600}
                font-family="'IBM Plex Mono', monospace"
              >
                YOU ARE HERE
              </text>
            </g>
          );
        })()}

        {/* Convergence zone */}
        {convergenceZone && (
          <g>
            <rect
              x={(xPos(convergenceZone.start) + xPos(convergenceZone.start - 1)) / 2}
              y={journeyMeta[0].y - 22}
              width={(xPos(convergenceZone.end) + xPos(Math.min(convergenceZone.end + 1, 7))) / 2 - (xPos(convergenceZone.start) + xPos(convergenceZone.start - 1)) / 2}
              height={(journeyMeta[journeyMeta.length - 1]?.y ?? journeyMeta[0].y) - journeyMeta[0].y + 44}
              rx={6}
              fill="#fbbf24"
              fill-opacity={0.08}
              stroke="#fbbf24"
              stroke-opacity={0.35}
              stroke-width={1.5}
              stroke-dasharray="4 4"
            />
          </g>
        )}

        {/* Protocol labels + flow lines + waypoints */}
        {journeyMeta.map((jm) => {
          const tooltipAbove = jm.laneIdx === 0;
          return (
            <g key={jm.id}>
              {/* Flow line */}
              <FlowLine y={jm.y} activeSet={jm.activeSet} color={jm.color} />

              {/* Active waypoints */}
              {jm.waypoints.map(wp => {
                const isHov = hovered?.journeyId === jm.id && hovered?.stage === wp.stage;
                const cpType = getCheckpointType(wp.stage);
                return (
                  <g key={`${jm.id}-${wp.stage}`}>
                    <CheckpointShape
                      x={xPos(wp.stage)}
                      y={jm.y}
                      type={cpType}
                      color={jm.color}
                      size={isHov ? 14 : 12}
                    />
                    <WaypointDot
                      x={xPos(wp.stage)}
                      y={jm.y}
                      color={jm.color}
                      isHovered={isHov}
                      onEnter={() => setHovered({ journeyId: jm.id, stage: wp.stage })}
                      onLeave={() => setHovered(null)}
                    />
                    {isHov && (
                      <Tooltip
                        x={xPos(wp.stage)}
                        y={jm.y}
                        waypoint={wp}
                        color={jm.color}
                        above={tooltipAbove}
                        svgWidth={W}
                      />
                    )}
                  </g>
                );
              })}

              {/* Inactive stage markers */}
              {STAGE_NAMES.map((_, i) => {
                if (jm.activeSet.has(i)) return null;
                return (
                  <circle
                    key={`inactive-${jm.id}-${i}`}
                    cx={xPos(i)}
                    cy={jm.y}
                    r={5.5}
                    fill="none"
                    stroke={LABEL_DIM}
                    stroke-width={1.5}
                  />
                );
              })}
            </g>
          );
        })}

        {/* X-axis: stage labels — always rendered, including in compact mode,
            so every JourneyMap on the page enumerates the 8 STP stages
            with the same glyph + name treatment as the Hero. */}
        {STAGE_NAMES.map((name, i) => {
          const anyActive = journeyMeta.some(jm => jm.activeSet.has(i));
          const isHighlighted = highlightStages?.includes(i);
          const labelColor = isHighlighted ? '#fbbf24' : anyActive ? LABEL_BRIGHT : LABEL_DIM;
          const nameColor = isHighlighted ? '#fbbf24' : anyActive ? LABEL_MID : LABEL_DIM;
          return (
            <g key={`label-${i}`}>
              <text
                x={xPos(i)}
                y={laneStart + totalLanesH + 22}
                text-anchor="middle"
                fill={labelColor}
                font-size={10}
                font-family="'IBM Plex Mono', monospace"
                font-weight={anyActive ? 500 : 400}
              >
                {STAGE_GLYPHS[i]}
              </text>
              <text
                x={xPos(i)}
                y={laneStart + totalLanesH + 36}
                text-anchor="middle"
                fill={nameColor}
                font-size={9}
                font-family="'IBM Plex Sans', Inter, sans-serif"
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default JourneyMap;
