import { useEffect, useRef } from 'preact/hooks';

/**
 * TransactionLog — Terminal-style real-time log display.
 *
 * Dark background, green monospace text, auto-scrolling.
 * Receives log entries as an array of strings.
 */

export interface TransactionLogProps {
  entries: string[];
}

export function TransactionLog({ entries }: TransactionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div
      ref={scrollRef}
      class="tx-log-entries"
      style={{
        fontFamily: "'IBM Plex Mono', 'SF Mono', 'Fira Code', monospace",
        fontSize: '12px',
        background: '#0a0e17',
        color: '#a3e635',
        borderRadius: '8px',
        padding: '16px',
        maxHeight: '220px',
        overflowY: 'auto',
        border: '1px solid #1a1f2a',
      }}
    >
      {entries.length === 0 ? (
        <div style={{ color: '#4b5563' }}>Waiting for wallet connection…</div>
      ) : (
        entries.map((entry, i) => (
          <div key={i} style={{ marginBottom: '4px', lineHeight: '1.5' }}>
            {entry}
          </div>
        ))
      )}
    </div>
  );
}

export default TransactionLog;
