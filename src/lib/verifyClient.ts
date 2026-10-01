import type { VerificationResult } from "@/lib/verify";

/**
 * Browser-side verification lookup. Goes through /api/verify-certificate
 * instead of hitting the RPC endpoint directly — public Sepolia RPC nodes
 * (e.g. rpc.sepolia.org) don't send CORS headers, so a direct
 * JsonRpcProvider fetch from the browser fails silently with a CORS error.
 * Routing through our own API (server-to-server, no CORS involved) avoids
 * depending on the RPC provider's CORS policy at all.
 */
export async function verifyCertificateHashClient(hash: string): Promise<VerificationResult> {
  const res = await fetch("/api/verify-certificate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash }),
  });
  const data = (await res.json()) as { result?: VerificationResult; error?: string };
  if (!res.ok || !data.result) {
    throw new Error(data.error ?? "Verification failed.");
  }
  return data.result;
}
