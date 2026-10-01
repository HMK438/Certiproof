"use client";

import { Loader2, LogOut, Wallet } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletConnectButton() {
  const { address, isConnecting, connect, disconnect } = useWallet();

  if (address) {
    return (
      <button
        type="button"
        onClick={disconnect}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-rose-500/50 hover:text-rose-400"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </span>
        {shortenAddress(address)}
        <LogOut className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={isConnecting}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
