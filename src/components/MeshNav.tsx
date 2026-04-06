/**
 * MeshNav — Shared footer nav for the Agentic Five mesh.
 *
 * Five peer tiles, one per site, current site highlighted. This is the
 * entire connective tissue between Stable402, StableM2M, StableKYA,
 * StableL1, and AtomicDvP. No hub, no center — just five camera angles
 * on the same story of compliant agentic commerce.
 *
 * Usage (in any site's Footer.astro or equivalent):
 *
 *   <MeshNav currentSite="stable402" client:visible />
 *
 * This is the reference implementation. Copy verbatim into the other
 * four sites as-is (paths and colors are site-local but the file has
 * no site-local dependencies beyond CSS vars defined in global.css).
 *
 * Governed by STRATEGY.md "Mesh architecture rules" (private internal
 * doc in atlas_compliance/).
 */

export type MeshSite = 'stable402' | 'stablem2m' | 'stablekya' | 'stablel1' | 'atomicdvp';

interface MeshTile {
  slug: MeshSite;
  name: string;
  url: string;
  /** Camera angle — one-word framing from STRATEGY.md */
  angle: string;
  /** One-sentence thesis, answers the site's defining question */
  thesis: string;
}

const TILES: MeshTile[] = [
  {
    slug: 'stable402',
    name: 'Stable402',
    url: 'https://stable402.com',
    angle: 'Protocol',
    thesis: 'How an agent is told "pay before you read."',
  },
  {
    slug: 'stablem2m',
    name: 'StableM2M',
    url: 'https://stablem2m.com',
    angle: 'Actor',
    thesis: 'Who the buying agent is, and how it discovers what to pay for.',
  },
  {
    slug: 'stablekya',
    name: 'StableKYA',
    url: 'https://stablekya.com',
    angle: 'Identity',
    thesis: 'Who the legal principal behind the agent is.',
  },
  {
    slug: 'stablel1',
    name: 'StableL1',
    url: 'https://stablel1.com',
    angle: 'Settlement',
    thesis: 'Where value lands, under whose chain rules.',
  },
  {
    slug: 'atomicdvp',
    name: 'AtomicDvP',
    url: 'https://atomicdvp.com',
    angle: 'Atomicity',
    thesis: 'What binds delivery and payment into a single atomic step.',
  },
];

interface MeshNavProps {
  /** Slug of the currently-rendered site; that tile is highlighted, non-clickable. */
  currentSite: MeshSite;
}

export default function MeshNav({ currentSite }: MeshNavProps) {
  return (
    <nav
      aria-label="Agentic Five mesh"
      style={{
        fontFamily: 'var(--font-sans)',
        borderTop: '1px solid var(--border)',
        padding: '32px 24px 28px',
        background: 'var(--bg)',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 14,
          }}
        >
          The Agentic Five · a peer mesh on compliant agentic commerce
        </div>

        <ul
          style={{
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 10,
            margin: 0,
            padding: 0,
          }}
        >
          {TILES.map((tile) => {
            const isCurrent = tile.slug === currentSite;
            const baseStyle = {
              display: 'block',
              padding: '12px 14px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              textDecoration: 'none',
              background: isCurrent ? 'var(--bg-dark)' : 'transparent',
              color: isCurrent ? '#faf9f6' : 'var(--text)',
              transition: 'border-color 120ms ease, transform 120ms ease',
              cursor: isCurrent ? 'default' : 'pointer',
              height: '100%',
            } as const;

            const inner = (
              <>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isCurrent ? 'var(--accent)' : 'var(--text-muted)',
                    marginBottom: 4,
                  }}
                >
                  {tile.angle}
                  {isCurrent ? ' · you are here' : ''}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 6,
                  }}
                >
                  {tile.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 12.5,
                    lineHeight: 1.45,
                    color: isCurrent ? '#d6d3cf' : 'var(--text-muted)',
                  }}
                >
                  {tile.thesis}
                </div>
              </>
            );

            return (
              <li key={tile.slug} style={{ listStyle: 'none' }}>
                {isCurrent ? (
                  <div style={baseStyle} aria-current="page">
                    {inner}
                  </div>
                ) : (
                  <a href={tile.url} style={baseStyle} rel="noopener">
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
