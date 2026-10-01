"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { computeCertificateHash, type CertificateFields } from "@/lib/certificateHash";
import { getWriteContract, isContractConfigured } from "@/lib/contract";

type IssueResult = {
  hash: string;
  txHash: string;
  verifyUrl: string;
  qrDataUrl: string;
};

export default function IssuePage() {
  const { address, provider, connect, isConnecting } = useWallet();
  const [fetchedAuthorized, setFetchedAuthorized] = useState<boolean | null>(null);
  const isAuthorized = address ? fetchedAuthorized : null;
  const [fields, setFields] = useState<CertificateFields>({
    studentName: "",
    studentId: "",
    institution: "",
    credentialType: "",
    issueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IssueResult | null>(null);

  useEffect(() => {
    if (!address || !isContractConfigured()) return;
    let cancelled = false;
    fetch("/api/check-issuer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })
      .then((res) => res.json())
      .then((data: { isIssuer?: boolean }) => {
        if (!cancelled) setFetchedAuthorized(data.isIssuer ?? null);
      })
      .catch(() => {
        if (!cancelled) setFetchedAuthorized(null);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!provider || !address) return;

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const hash = computeCertificateHash(fields);
      const contract = await getWriteContract(provider);
      const tx = await contract.issueCertificate(hash);
      const receipt = await tx.wait();

      const verifyUrl = `${window.location.origin}/verify/${hash}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        color: { dark: "#0f172a", light: "#f1f5f9" },
      });

      setResult({ hash, txHash: receipt?.hash ?? tx.hash, verifyUrl, qrDataUrl });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed.";
      setError(message.length > 300 ? "Transaction failed or was rejected." : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isContractConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-400" />
        <h1 className="mt-4 text-xl font-semibold text-slate-100">Contract not deployed yet</h1>
        <p className="mt-2 text-sm text-slate-400">
          Set <code className="rounded bg-slate-900 px-1.5 py-0.5">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in
          .env.local once CertificateRegistry is deployed to Sepolia.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Issuer Dashboard
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-100">
          Issue a Certificate
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Only authorized issuer wallets can anchor a certificate on-chain. Connect the wallet
          added as an issuer on the contract to continue.
        </p>
      </div>

      {!address ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center">
          <Wallet className="h-8 w-8 text-blue-400" />
          <p className="text-sm text-slate-400">Connect your wallet to check issuer status.</p>
          <button
            type="button"
            onClick={connect}
            disabled={isConnecting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-blue-400 disabled:opacity-60"
          >
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            Connect Wallet
          </button>
        </div>
      ) : isAuthorized === false ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <ShieldAlert className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-amber-300">
            This wallet is not an authorized issuer on CertificateRegistry. Ask the contract
            owner to call <code className="rounded bg-slate-900 px-1.5 py-0.5">addIssuer()</code>{" "}
            with your address.
          </p>
        </div>
      ) : (
        <>
          {isAuthorized === true && (
            <div className="mt-8 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Wallet verified as an authorized issuer
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Student Name"
                value={fields.studentName}
                onChange={(v) => setFields((f) => ({ ...f, studentName: v }))}
                placeholder="Jane Doe"
              />
              <Field
                label="Student ID"
                value={fields.studentId}
                onChange={(v) => setFields((f) => ({ ...f, studentId: v }))}
                placeholder="SWE-2022-0141"
              />
            </div>
            <Field
              label="Institution"
              value={fields.institution}
              onChange={(v) => setFields((f) => ({ ...f, institution: v }))}
              placeholder="University of Malakand"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Credential Type"
                value={fields.credentialType}
                onChange={(v) => setFields((f) => ({ ...f, credentialType: v }))}
                placeholder="BS Software Engineering"
              />
              <Field
                label="Issue Date"
                type="date"
                value={fields.issueDate}
                onChange={(v) => setFields((f) => ({ ...f, issueDate: v }))}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || Object.values(fields).some((v) => !v.trim())}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {isSubmitting ? "Anchoring on-chain..." : "Issue Certificate"}
            </button>
          </form>
        </>
      )}

      {result && (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-300">Certificate issued on-chain</p>
          <Image src={result.qrDataUrl} alt="Verification QR code" width={180} height={180} className="rounded-lg" unoptimized />
          <div className="w-full space-y-1 text-left text-xs">
            <p className="text-slate-500">Certificate hash</p>
            <p className="break-all rounded bg-slate-950 px-3 py-2 font-mono text-slate-300">{result.hash}</p>
            <p className="mt-2 text-slate-500">Verification link</p>
            <a
              href={result.verifyUrl}
              className="block break-all rounded bg-slate-950 px-3 py-2 font-mono text-blue-400 hover:underline"
            >
              {result.verifyUrl}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-500/60"
      />
    </div>
  );
}
