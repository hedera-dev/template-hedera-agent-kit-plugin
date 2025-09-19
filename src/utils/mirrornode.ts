import { LedgerId } from "@hashgraph/sdk";

/**
 * Map to get the public mirrornode based on client's ledger
 */

export const LedgerIdToBaseUrl: Map<LedgerId, string> = new Map([
  [LedgerId.MAINNET, "https://mainnet-public.mirrornode.hedera.com/api/v1"],
  [LedgerId.TESTNET, "https://testnet.mirrornode.hedera.com/api/v1"],
]);
