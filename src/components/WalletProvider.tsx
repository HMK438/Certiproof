"use client";

import { BrowserProvider } from "ethers";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { connectWallet, hasInjectedWallet, switchToSepolia, SEPOLIA_CHAIN_ID } from "@/lib/contract";

type WalletState = {
  address: string | null;
  provider: BrowserProvider | null;
  chainId: bigint | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!hasInjectedWallet()) {
      setError("No wallet found. Install MetaMask to issue or manage certificates.");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const result = await connectWallet();
      if (result.chainId !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
        const refreshed = await connectWallet();
        setAddress(refreshed.address);
        setProvider(refreshed.provider);
        setChainId(refreshed.chainId);
      } else {
        setAddress(result.address);
        setProvider(result.provider);
        setChainId(result.chainId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setChainId(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, provider, chainId, isConnecting, error, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
