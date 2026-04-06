/**
 * Pre-built journey configurations for JourneyMap.
 * Each journey describes a protocol's waypoints across the 8 STP stages.
 */

export interface Waypoint {
  stage: number;       // 0-indexed (0 = Intent, 7 = Finality)
  label: string;       // Station name
  narrative: string;   // Hover description
}

export interface JourneyConfig {
  id: string;
  label: string;
  color: string;
  waypoints: Waypoint[];
}

export const X402_JOURNEY: JourneyConfig = {
  id: 'x402',
  label: 'x402',
  color: '#fbbf24',
  waypoints: [
    { stage: 0, label: 'Wallet', narrative: 'Reader opens Coinbase Smart Wallet — the journey begins here' },
    { stage: 1, label: 'Wallet Connect', narrative: 'Reader delegates spending authority via EIP-1193 to the Coinbase Smart Wallet on Base Sepolia' },
    { stage: 2, label: 'Identity', narrative: 'Wallet identity verified — passkey + address + chain confirmed. In a fully agentic flow, the buyer agent would discover StableKYA here via the x402 Bazaar extension (the facilitator /discovery/resources endpoint) instead of hardcoding the URL.' },
    { stage: 3, label: 'HTTP 402', narrative: 'StableKYA Worker responds with 402 + base64 PAYMENT-REQUIRED header' },
    { stage: 4, label: 'x402 Negotiate', narrative: 'Payment requirements parsed — scheme: exact, asset: USDC, network: base-sepolia' },
    { stage: 5, label: 'EIP-3009', narrative: 'Gasless transferWithAuthorization signed against Circle USDC contract' },
    { stage: 6, label: 'Coinbase CDP', narrative: 'Coinbase CDP x402 facilitator screens (Chainalysis OFAC) and submits the transfer' },
    { stage: 7, label: 'Base L2 Finality', narrative: 'On-chain finality on Base Sepolia (~2s settlement)' },
  ],
};

export const ALL_JOURNEYS: JourneyConfig[] = [X402_JOURNEY];
