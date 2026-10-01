import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import { CERTIFICATE_REGISTRY_ABI } from "@/lib/contractAbi";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
export const SEPOLIA_CHAIN_ID = BigInt(11155111);
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export function isContractConfigured(): boolean {
  return CONTRACT_ADDRESS.length > 0;
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function connectWallet(): Promise<{
  provider: BrowserProvider;
  address: string;
  chainId: bigint;
}> {
  if (!hasInjectedWallet() || !window.ethereum) {
    throw new Error("No wallet found — install MetaMask to continue.");
  }
  const provider = new BrowserProvider(window.ethereum);
  const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
  const network = await provider.getNetwork();
  return { provider, address: accounts[0], chainId: network.chainId };
}

/** Prompts MetaMask to switch to Sepolia, adding the network if the wallet doesn't know it yet. */
export async function switchToSepolia(): Promise<void> {
  if (!hasInjectedWallet() || !window.ethereum) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (err) {
    const code = (err as { code?: number } | null)?.code;
    if (code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: "Sepolia",
            nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

/** Read-only contract instance for verification lookups — no wallet required. */
export function getReadOnlyContract(): Contract {
  const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
  const provider = new JsonRpcProvider(rpcUrl);
  return new Contract(CONTRACT_ADDRESS, CERTIFICATE_REGISTRY_ABI, provider);
}

/** Signer-backed contract instance for issuing/revoking — requires a connected wallet. */
export async function getWriteContract(provider: BrowserProvider): Promise<Contract> {
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, CERTIFICATE_REGISTRY_ABI, signer);
}
