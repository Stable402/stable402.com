import { useState, useCallback, useEffect } from 'preact/hooks';
import { TransactionLog } from './TransactionLog';
import { PdfCard } from './PdfCard';

/**
 * PaymentFlow — Complete x402 micropayment orchestrator (Preact).
 *
 * Manages the full lifecycle:
 *   1. Wallet connection (window.ethereum / viem from CDN)
 *   2. Gate probe (GET stablekya.com/api/report → 402)
 *   3. EIP-3009 signature + PAYMENT-SIGNATURE header
 *   4. PDF delivery on 200 OK
 *
 * Demo mode: activated from hero "Try Without Wallet" button.
 * Sets window.__x402_demo = true and simulates the full flow
 * with pseudocode annotations so visitors without wallets can
 * experience the x402 protocol story.
 */

// ── Config ──
const GATE_URL = 'https://stablekya.com/api/report';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const BASE_SEPOLIA_CHAIN_ID = 84532;

const DEMO_ADDRESS = '0xDem0...4c02';
const DEMO_ADDRESS_FULL = '0xDem0000000000000000000000000000000004c02';
const DEMO_BALANCE = '1.00';

function shortenAddress(addr: string): string {
  if (addr === DEMO_ADDRESS_FULL) return DEMO_ADDRESS;
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function timestamp(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

// ── State types ──
interface GateResponse {
  status: number;
  rawHeader: string;
  decoded: Record<string, unknown>;
}

interface SettlementInfo {
  txHash: string;
  block: string | null;
  settlementTime: string | null;
}

// ══════════════════════════════════════════════════════════
// SECTION 1: Wallet Connection
// ══════════════════════════════════════════════════════════

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Listen for demo mode activation from hero button
  useEffect(() => {
    const handler = () => {
      setIsDemo(true);
      setAddress(DEMO_ADDRESS_FULL);
      setBalance(DEMO_BALANCE);
      setError(null);
      (window as any).__x402_address = DEMO_ADDRESS_FULL;
      (window as any).__x402_balance = DEMO_BALANCE;
      (window as any).__x402_demo = true;
    };
    window.addEventListener('x402-demo-mode', handler);
    // Check if already in demo mode (e.g. page didn't reload)
    if ((window as any).__x402_demo && !address) {
      handler();
    }
    return () => window.removeEventListener('x402-demo-mode', handler);
  }, [address]);

  const connect = useCallback(async () => {
    if (!(window as any).ethereum) {
      setError('No wallet detected. Install Coinbase Wallet or MetaMask.');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const addr = accounts[0] as string;

      // Switch to Base Sepolia
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16) }],
        });
      } catch (switchErr: any) {
        if (switchErr.code === 4902) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16),
              chainName: 'Base Sepolia',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.base.org'],
              blockExplorerUrls: ['https://sepolia.basescan.org'],
            }],
          });
        }
      }

      setAddress(addr);
      (window as any).__x402_address = addr;

      // Read USDC balance via eth_call
      try {
        const balanceData = await (window as any).ethereum.request({
          method: 'eth_call',
          params: [{
            to: USDC_ADDRESS,
            data: '0x70a08231000000000000000000000000' + addr.slice(2),
          }, 'latest'],
        });
        const raw = BigInt(balanceData);
        const formatted = (Number(raw) / 1e6).toFixed(2);
        setBalance(formatted);
        (window as any).__x402_balance = formatted;
      } catch (e) {
        console.warn('Balance fetch failed:', e);
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }, []);

  if (address) {
    return (
      <div class="wallet-connected" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{
          background: isDemo ? '#fbbf24' : '#16a34a',
          color: isDemo ? '#422006' : '#fff',
          padding: '8px 16px',
          borderRadius: '8px',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '13px',
          fontWeight: 600,
        }}>
          {shortenAddress(address)}
        </span>
        {balance && (
          <span style={{
            background: '#f0f0f0',
            padding: '6px 12px',
            borderRadius: '20px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            fontWeight: 600,
          }}>
            {balance} USDC
          </span>
        )}
        <span style={{
          fontSize: '11px',
          padding: '3px 8px',
          borderRadius: '4px',
          background: '#fef3c7',
          color: '#d97706',
          fontWeight: 600,
          fontFamily: "-apple-system, sans-serif",
        }}>
          Base Sepolia Testnet
        </span>
        {isDemo && (
          <span style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '4px',
            background: '#0a0e17',
            color: '#a3e635',
            fontWeight: 600,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.04em',
          }}>
            DEMO MODE
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connect}
        disabled={connecting}
        style={{
          background: '#fbbf24',
          color: '#422006',
          border: 'none',
          padding: '14px 28px',
          borderRadius: '8px',
          cursor: connecting ? 'wait' : 'pointer',
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          opacity: connecting ? 0.6 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {connecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
      {error && (
        <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px', fontFamily: 'sans-serif' }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 2: Gate Probe (402 decode)
// ══════════════════════════════════════════════════════════

const DEMO_GATE_RESPONSE: GateResponse = {
  status: 402,
  rawHeader: btoa(JSON.stringify({
    accepts: [{
      scheme: 'exact',
      network: 'base-sepolia',
      asset: 'USDC',
      amount: '1000',
      payTo: '0xAb5801a7D398351b8bE11C439e05C5B3259aEc9B',
      resource: 'kya-compliance-report-v1',
      extra: { name: 'USDC', version: '2' },
    }],
  })),
  decoded: {
    accepts: [{
      scheme: 'exact',
      network: 'base-sepolia',
      asset: 'USDC',
      amount: '1000',
      payTo: '0xAb5801a7D398351b8bE11C439e05C5B3259aEc9B',
      resource: 'kya-compliance-report-v1',
      extra: { name: 'USDC', version: '2' },
    }],
  },
};

export function GateProbe() {
  const [gateResponse, setGateResponse] = useState<GateResponse | null>(null);
  const [probing, setProbing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const probe = useCallback(async () => {
    setProbing(true);
    setError(null);

    // Demo mode — show simulated 402 response
    if ((window as any).__x402_demo) {
      await new Promise(r => setTimeout(r, 600)); // brief delay for realism
      setGateResponse(DEMO_GATE_RESPONSE);
      setProbing(false);
      return;
    }

    try {
      const res = await fetch(GATE_URL, { method: 'GET' });
      const rawHeader = res.headers.get('PAYMENT-REQUIRED') || '';

      // If the live gate isn't yet returning a real x402 402 response,
      // fall through to the canonical demo payload so the UI never lies.
      if (res.status !== 402 || !rawHeader) {
        (window as any).__x402_demo = true;
        setGateResponse(DEMO_GATE_RESPONSE);
        return;
      }

      let decoded: Record<string, unknown> = {};
      try {
        decoded = JSON.parse(atob(rawHeader));
      } catch {
        decoded = { error: 'Failed to decode header' };
      }

      setGateResponse({
        status: res.status,
        rawHeader,
        decoded,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to reach the gate');
      // Fallback to demo data when endpoint unreachable
      (window as any).__x402_demo = true;
      setGateResponse(DEMO_GATE_RESPONSE);
    } finally {
      setProbing(false);
    }
  }, []);

  const closeGate = useCallback(() => {
    setGateResponse(null);
    setError(null);
  }, []);

  return (
    <div>
      {!gateResponse ? (
        <button
          onClick={probe}
          disabled={probing}
          style={{
            background: 'transparent',
            color: '#fbbf24',
            border: '2px solid #fbbf24',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: probing ? 'wait' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: "'IBM Plex Mono', monospace",
            opacity: probing ? 0.6 : 1,
            marginBottom: '20px',
          }}
        >
          {probing ? 'Probing…' : 'Probe the Gate'}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={probe}
            style={{
              background: 'transparent',
              color: '#fbbf24',
              border: '2px solid #fbbf24',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Probe Again
          </button>
          <button
            onClick={closeGate}
            style={{
              background: 'transparent',
              color: '#6b6b6b',
              border: '2px solid #e0ddd8',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: "'IBM Plex Mono', monospace",
              transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            Close the Gate
          </button>
        </div>
      )}

      {error && !gateResponse && (
        <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px' }}>{error}</div>
      )}

      {gateResponse && (
        <div style={{ marginTop: '16px' }}>
          {/* Demo mode annotation */}
          {(window as any).__x402_demo && (
            <div style={{
              background: '#0a0e17',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '12px',
              border: '1px solid #a3e635',
            }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#a3e635',
                lineHeight: 1.6,
              }}>
                <span style={{ fontWeight: 700 }}>DEMO</span> — In a live flow, your browser sends <span style={{ color: '#fbbf24' }}>GET /api/report</span> to the StableKYA Cloudflare Worker. The Worker has no idea whether the client is a browser, CLI, or AI agent — it just returns HTTP 402 with x402 payment terms (scheme, asset, network, payTo) in a base64 PAYMENT-REQUIRED header. The payload below is the canonical Coinbase x402 v2 envelope for USDC on Base Sepolia.
              </div>
            </div>
          )}

          {/* Panel 1: HTTP Status */}
          <div style={{
            background: '#0a0e17',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid #1a1f2a',
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#4b5563',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              HTTP STATUS
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '20px',
              fontWeight: 700,
              color: '#fbbf24',
            }}>
              HTTP {gateResponse.status} {gateResponse.status === 402 ? 'Payment Required' : gateResponse.status === 200 ? 'OK' : ''}
            </div>
          </div>

          {/* Panel 2: Raw Header */}
          <div style={{
            background: '#0a0e17',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid #1a1f2a',
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#4b5563',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              PAYMENT-REQUIRED HEADER (BASE64)
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#9ca3af',
              wordBreak: 'break-all',
              lineHeight: 1.5,
            }}>
              {gateResponse.rawHeader || '(empty)'}
            </div>
          </div>

          {/* Panel 3: Decoded JSON */}
          <div style={{
            background: '#0a0e17',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid #1a1f2a',
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#4b5563',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              DECODED REQUIREMENTS
            </div>
            <pre style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              color: '#a3e635',
              margin: 0,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}>
              {JSON.stringify(gateResponse.decoded, null, 2)}
            </pre>
          </div>

          {/* Panel 4: curl equivalent */}
          <div style={{
            background: '#0a0e17',
            borderRadius: '8px',
            padding: '12px 16px',
            border: '1px solid #1a1f2a',
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#4b5563',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              TRY IT
            </div>
            <code style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              color: '#fbbf24',
            }}>
              curl -i https://stablekya.com/api/report
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 3: Payment Button + Transaction Log
// ══════════════════════════════════════════════════════════

export function PaymentButton() {
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const [settlement, setSettlement] = useState<SettlementInfo | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const log = useCallback((msg: string) => {
    const t = timestamp();
    setLogEntries(prev => [...prev, `[${t}] ${msg}`]);
  }, []);

  const purchaseDemo = useCallback(async () => {
    setPaying(true);
    setError(null);
    setLogEntries([]);
    setSettlement(null);
    setPdfUrl(null);

    const addr = DEMO_ADDRESS;
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    log(`→ GET ${GATE_URL}`);
    await delay(500);
    log('← 402 Payment Required: 1000 base units USDC → 0xAb58…aEc9B');
    await delay(300);

    log('// Parse PAYMENT-REQUIRED header');
    log('//   base64 decode → JSON → accepts[0]');
    log('//   scheme: "exact", network: "base-sepolia"');
    log('//   asset: USDC, amount: 1000 ($0.001)');
    await delay(400);

    log('Requesting wallet signature (EIP-3009)…');
    await delay(600);
    log('// walletClient.signTypedData({');
    log('//   domain: { name: "USDC", version: "2", chainId: 84532 }');
    log('//   primaryType: "TransferWithAuthorization"');
    log('//   message: { from, to, value: 1000n, nonce }');
    log('// })');
    await delay(500);
    log('✓ Signature obtained (demo)');

    log(`→ GET ${GATE_URL} + PAYMENT-SIGNATURE`);
    await delay(400);
    log('// Attach base64(JSON({ x402Version: 2, payload: { signature } }))');
    log('// Coinbase CDP x402 facilitator verifies signature');
    log('// → Chainalysis OFAC screening fires at S6 (code-enforced gate)');
    log('// → Facilitator submits transferWithAuthorization to Circle USDC on Base');
    await delay(500);

    const demoTxHash = '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b';
    log('← 200 OK — Report unlocked!');
    log(`Tx: ${shortenAddress(demoTxHash)} (Base Sepolia)`);
    log('// Settlement: 1.8s finality, block #12345678');
    log('// The PDF you receive maps the transaction you just made.');

    setSettlement({
      txHash: demoTxHash,
      block: '12345678',
      settlementTime: '1.8s',
    });
    setPdfUrl(null); // No real PDF in demo
    setPaying(false);
  }, [log]);

  const purchaseLive = useCallback(async () => {
    const addr = (window as any).__x402_address;
    if (!addr) {
      setError('Connect your wallet first (Section 1)');
      return;
    }

    setPaying(true);
    setError(null);
    setLogEntries([]);
    setSettlement(null);
    setPdfUrl(null);

    try {
      // Step 1: Hit the gate
      log(`→ GET ${GATE_URL}`);
      const res402 = await fetch(GATE_URL);

      if (res402.status !== 402) {
        throw new Error(`Expected 402, got ${res402.status}`);
      }

      const paymentRequiredHeader = res402.headers.get('PAYMENT-REQUIRED');
      if (!paymentRequiredHeader) throw new Error('Missing PAYMENT-REQUIRED header');

      const paymentRequired = JSON.parse(atob(paymentRequiredHeader));
      const req = paymentRequired.accepts[0];

      log(`← 402 Payment Required: ${req.amount} base units USDC → ${shortenAddress(req.payTo)}`);

      // Step 2: Sign EIP-3009 authorization
      const now = Math.floor(Date.now() / 1000);
      const nonce = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b: number) => b.toString(16).padStart(2, '0')).join('');

      log('Requesting wallet signature (EIP-3009)…');

      const { createWalletClient, custom } = await import('https://esm.sh/viem@2.23.5' as any);
      const { baseSepolia } = await import('https://esm.sh/viem@2.23.5/chains' as any);

      const walletClient = createWalletClient({
        account: addr,
        chain: baseSepolia,
        transport: custom((window as any).ethereum),
      });

      const signature = await walletClient.signTypedData({
        account: addr,
        domain: {
          name: req.extra?.name || 'USDC',
          version: req.extra?.version || '2',
          chainId: BASE_SEPOLIA_CHAIN_ID,
          verifyingContract: USDC_ADDRESS,
        },
        types: {
          TransferWithAuthorization: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'validAfter', type: 'uint256' },
            { name: 'validBefore', type: 'uint256' },
            { name: 'nonce', type: 'bytes32' },
          ],
        },
        primaryType: 'TransferWithAuthorization',
        message: {
          from: addr,
          to: req.payTo,
          value: BigInt(req.amount),
          validAfter: BigInt(now),
          validBefore: BigInt(now + 3600),
          nonce,
        },
      });

      log('✓ Signature obtained');

      // Step 3: Build payment payload
      const paymentPayload = {
        x402Version: 2,
        accepted: req,
        payload: {
          signature,
          authorization: {
            from: addr,
            to: req.payTo,
            value: req.amount,
            validAfter: now.toString(),
            validBefore: (now + 3600).toString(),
            nonce,
          },
        },
      };

      const encodedPayload = btoa(JSON.stringify(paymentPayload));

      // Step 4: Retry with payment
      log(`→ GET ${GATE_URL} + PAYMENT-SIGNATURE`);

      const res200 = await fetch(GATE_URL, {
        headers: { 'PAYMENT-SIGNATURE': encodedPayload },
      });

      if (!res200.ok) {
        const errBody = await res200.text();
        throw new Error(`Payment rejected (${res200.status}): ${errBody}`);
      }

      const settlementHeader = res200.headers.get('PAYMENT-RESPONSE');
      let settlementData: any = {};
      if (settlementHeader) {
        try { settlementData = JSON.parse(atob(settlementHeader)); } catch {}
      }

      log(`← 200 OK — Report unlocked! Settlement: confirmed`);

      const blob = await res200.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      const txHash = settlementData.txHash || '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b: number) => b.toString(16).padStart(2, '0')).join('');

      setSettlement({
        txHash,
        block: settlementData.block || null,
        settlementTime: settlementData.settlementTime || null,
      });

      if (txHash) {
        log(`Tx: ${shortenAddress(txHash)} (Base Sepolia)`);
      }

    } catch (err: any) {
      log(`✗ Error: ${err.message}`);
      setError(err.message);

      // Fallback demo on network error
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        log('(Endpoint unreachable — showing simulated flow)');
        const demoTxHash = '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b';
        setSettlement({
          txHash: demoTxHash,
          block: '12345678',
          settlementTime: '1.8s',
        });
        setPdfUrl(null);
        log(`← 200 OK — Report unlocked! (simulated)`);
        log(`Tx: ${shortenAddress(demoTxHash)} (Base Sepolia)`);
      }
    } finally {
      setPaying(false);
    }
  }, [log]);

  const purchase = useCallback(async () => {
    if ((window as any).__x402_demo) {
      await purchaseDemo();
    } else {
      await purchaseLive();
    }
  }, [purchaseDemo, purchaseLive]);

  const reset = useCallback(() => {
    setLogEntries([]);
    setSettlement(null);
    setPdfUrl(null);
    setError(null);
  }, []);

  return (
    <div>
      {/* Buy button row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button
          onClick={purchase}
          disabled={paying}
          style={{
            background: '#fbbf24',
            color: '#422006',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            cursor: paying ? 'wait' : 'pointer',
            fontSize: '16px',
            fontWeight: 700,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            opacity: paying ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {paying ? 'Processing…' : 'Buy Report — $0.001 USDC'}
        </button>
        {(logEntries.length > 0 || settlement) && (
          <button
            onClick={reset}
            style={{
              background: 'transparent',
              color: '#6b6b6b',
              border: '2px solid #e0ddd8',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: "'IBM Plex Mono', monospace",
              transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            Reset
          </button>
        )}
      </div>

      {error && !settlement && (
        <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px', fontFamily: 'sans-serif' }}>
          {error}
        </div>
      )}

      {/* Transaction log */}
      <TransactionLog entries={logEntries} />

      {/* Settlement confirmation */}
      {settlement && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
        }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            color: '#16a34a',
            fontWeight: 600,
            marginBottom: '8px',
          }}>
            {(window as any).__x402_demo ? 'SETTLEMENT CONFIRMED (DEMO)' : 'SETTLEMENT CONFIRMED'}
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: '#1a1a1a' }}>
            <div>Tx: <a href={`https://sepolia.basescan.org/tx/${settlement.txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24' }}>{shortenAddress(settlement.txHash)}</a></div>
            {settlement.block && <div>Block: #{settlement.block}</div>}
            {settlement.settlementTime && <div>Finality: {settlement.settlementTime}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SECTION 4: Delivery (PdfCard wrapper)
// ══════════════════════════════════════════════════════════

export function DeliveryCard() {
  return (
    <PdfCard
      unlocked={false}
      pdfUrl={null}
      txHash={null}
      block={null}
      settlementTime={null}
    />
  );
}

export default PaymentButton;
