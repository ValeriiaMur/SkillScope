import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, base } from "viem/chains";
import type { AttestationData, AttestationResult } from "@skillscope/shared";

const ATTESTATION_ABI = parseAbi([
  "function attest(bytes32 skillFileHash, string skillName, uint256 score, uint256 executionCount, uint256 successCount, uint256 timestamp, string erc8004AgentId) external returns (uint256)",
  "event Attested(uint256 indexed attestationId, bytes32 indexed skillFileHash, string skillName, uint256 score, address attester, uint256 timestamp)",
]);

export interface AttestOptions {
  contractAddress: Hex;
  privateKey: Hex;
  rpcUrl?: string;
  useMainnet?: boolean;
}

export async function attestOnchain(
  data: AttestationData,
  opts: AttestOptions
): Promise<AttestationResult> {
  const chain = opts.useMainnet ? base : baseSepolia;
  const transport = http(opts.rpcUrl);
  const account = privateKeyToAccount(opts.privateKey);

  const walletClient = createWalletClient({
    account,
    chain,
    transport,
  });

  const publicClient = createPublicClient({
    chain,
    transport,
  });

  const skillFileHashBytes = `0x${data.skillFileHash.padEnd(64, "0")}` as Hex;

  const hash = await walletClient.writeContract({
    address: opts.contractAddress,
    abi: ATTESTATION_ABI,
    functionName: "attest",
    args: [
      skillFileHashBytes,
      data.skillName,
      BigInt(Math.round(data.score)),
      BigInt(data.executionCount),
      BigInt(data.successCount),
      BigInt(data.timestamp),
      data.erc8004AgentId || "",
    ],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const explorerBase = opts.useMainnet
    ? "https://basescan.org"
    : "https://sepolia.basescan.org";

  return {
    txHash: hash,
    blockNumber: Number(receipt.blockNumber),
    attestationId: receipt.logs[0]?.topics[1] || "0",
    explorerUrl: `${explorerBase}/tx/${hash}`,
  };
}
