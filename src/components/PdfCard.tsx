/**
 * PdfCard — Download card for the delivered KYA compliance report.
 *
 * Shows thumbnail, title, subtitle, and download button.
 * Active only after successful payment.
 */

export interface PdfCardProps {
  unlocked: boolean;
  pdfUrl: string | null;
  txHash: string | null;
  block: string | null;
  settlementTime: string | null;
}

export function PdfCard({ unlocked, pdfUrl, txHash, block, settlementTime }: PdfCardProps) {
  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${unlocked ? '#16a34a' : '#e0ddd8'}`,
      borderRadius: '12px',
      padding: '28px',
      maxWidth: '520px',
      margin: '0 auto',
      opacity: unlocked ? 1 : 0.5,
      transition: 'opacity 0.3s, border-color 0.3s',
    }}>
      {/* Thumbnail area */}
      <div style={{
        background: unlocked ? '#f0fdf4' : '#f5f5f0',
        borderRadius: '8px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '20px',
        border: `1px solid ${unlocked ? '#bbf7d0' : '#e0ddd8'}`,
      }}>
        <div style={{
          fontSize: '48px',
          lineHeight: '1',
          marginBottom: '8px',
        }}>
          {unlocked ? '\u{1F4C4}' : '\u{1F512}'}
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          color: unlocked ? '#16a34a' : '#6b6b6b',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {unlocked ? 'REPORT READY' : 'LOCKED — PAYMENT REQUIRED'}
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: '18px',
        fontWeight: 700,
        color: '#1a1a1a',
        marginBottom: '6px',
        lineHeight: 1.3,
      }}>
        Know Your Agent: Anatomy of an x402 Compliant Transaction
      </h3>

      <p style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: '14px',
        color: '#6b6b6b',
        marginBottom: '20px',
        lineHeight: 1.5,
      }}>
        The compliance diagram inside this report maps the transaction you just completed.
      </p>

      {/* Download button */}
      {unlocked && pdfUrl ? (
        <a
          href={pdfUrl}
          download="kya-compliance-report.pdf"
          style={{
            display: 'inline-block',
            background: '#16a34a',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Download Report
        </a>
      ) : (
        <button
          disabled
          style={{
            display: 'inline-block',
            background: '#d1d5db',
            color: '#9ca3af',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'not-allowed',
          }}
        >
          Download Report
        </button>
      )}

      {/* Settlement receipt */}
      {unlocked && txHash && (
        <table style={{
          width: '100%',
          marginTop: '20px',
          borderCollapse: 'collapse',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '12px',
        }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 0', color: '#6b6b6b', borderBottom: '1px solid #e0ddd8' }}>Facilitator</td>
              <td style={{ padding: '6px 0', color: '#1a1a1a', borderBottom: '1px solid #e0ddd8', textAlign: 'right' }}>Coinbase CDP</td>
            </tr>
            <tr>
              <td style={{ padding: '6px 0', color: '#6b6b6b', borderBottom: '1px solid #e0ddd8' }}>Chain</td>
              <td style={{ padding: '6px 0', color: '#1a1a1a', borderBottom: '1px solid #e0ddd8', textAlign: 'right' }}>Base Sepolia</td>
            </tr>
            {block && (
              <tr>
                <td style={{ padding: '6px 0', color: '#6b6b6b', borderBottom: '1px solid #e0ddd8' }}>Block</td>
                <td style={{ padding: '6px 0', color: '#1a1a1a', borderBottom: '1px solid #e0ddd8', textAlign: 'right' }}>#{block}</td>
              </tr>
            )}
            {settlementTime && (
              <tr>
                <td style={{ padding: '6px 0', color: '#6b6b6b', borderBottom: '1px solid #e0ddd8' }}>Finality</td>
                <td style={{ padding: '6px 0', color: '#1a1a1a', borderBottom: '1px solid #e0ddd8', textAlign: 'right' }}>{settlementTime}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '6px 0', color: '#6b6b6b' }}>Tx Hash</td>
              <td style={{ padding: '6px 0', textAlign: 'right' }}>
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#fbbf24', fontSize: '11px' }}
                >
                  {txHash.slice(0, 8)}…{txHash.slice(-6)}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PdfCard;
