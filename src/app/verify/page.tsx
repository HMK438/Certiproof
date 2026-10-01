"use client";

import { FormEvent, useRef, useState } from "react";
import {
  AlertTriangle,
  Fingerprint,
  Loader2,
  ScanSearch,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import VerificationResultCard from "@/components/VerificationResultCard";
import {
  computeCertificateHash,
  isValidCertificateHash,
  type CertificateFields,
} from "@/lib/certificateHash";
import { isContractConfigured } from "@/lib/contract";
import type { VerificationResult } from "@/lib/verify";
import { verifyCertificateHashClient } from "@/lib/verifyClient";

type Tab = "hash" | "fields" | "upload";

const EMPTY_FIELDS: CertificateFields = {
  studentName: "",
  studentId: "",
  institution: "",
  credentialType: "",
  issueDate: "",
};

export default function VerifyPage() {
  const [tab, setTab] = useState<Tab>("hash");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Public Verification
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-100">
          Verify a Certificate
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Three ways to check authenticity — pick whichever matches what you have on hand.
        </p>
      </div>

      {!isContractConfigured() && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          The contract isn&apos;t deployed yet — verification will not return results until{" "}
          <code className="rounded bg-slate-900 px-1 py-0.5">NEXT_PUBLIC_CONTRACT_ADDRESS</code>{" "}
          is set.
        </div>
      )}

      <div className="mt-8 flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-1.5">
        <TabButton active={tab === "hash"} onClick={() => setTab("hash")} icon={Fingerprint}>
          Certificate ID
        </TabButton>
        <TabButton active={tab === "fields"} onClick={() => setTab("fields")} icon={ScanSearch}>
          Re-enter Details
        </TabButton>
        <TabButton active={tab === "upload"} onClick={() => setTab("upload")} icon={Sparkles}>
          AI Document Check
        </TabButton>
      </div>

      <div className="mt-6">
        {tab === "hash" && <HashLookup />}
        {tab === "fields" && <FieldsLookup />}
        {tab === "upload" && <AiUploadLookup />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Fingerprint;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
        active ? "bg-blue-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function HashLookup() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [checkedHash, setCheckedHash] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!isValidCertificateHash(trimmed)) {
      setError("That doesn't look like a valid certificate hash (expected 0x + 64 hex chars).");
      setResult(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const value = await verifyCertificateHashClient(trimmed);
      setResult(value);
      setCheckedHash(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the network. Try again shortly.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="0x..."
          className="flex-1 rounded-lg border border-slate-800 bg-black px-3.5 py-2.5 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-500/60"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-blue-400 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
          Verify
        </button>
      </form>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {result && <VerificationResultCard hash={checkedHash} result={result} />}
    </div>
  );
}

function FieldsLookup() {
  const [fields, setFields] = useState<CertificateFields>(EMPTY_FIELDS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [checkedHash, setCheckedHash] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const hash = computeCertificateHash(fields);
      const value = await verifyCertificateHashClient(hash);
      setResult(value);
      setCheckedHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the network. Try again shortly.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Type the same fields exactly as they appear on the certificate — this recomputes the
        identical hash the issuer originally anchored on-chain.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniField placeholder="Student name" value={fields.studentName} onChange={(v) => setFields((f) => ({ ...f, studentName: v }))} />
          <MiniField placeholder="Student ID" value={fields.studentId} onChange={(v) => setFields((f) => ({ ...f, studentId: v }))} />
        </div>
        <MiniField placeholder="Institution" value={fields.institution} onChange={(v) => setFields((f) => ({ ...f, institution: v }))} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniField placeholder="Credential type" value={fields.credentialType} onChange={(v) => setFields((f) => ({ ...f, credentialType: v }))} />
          <MiniField type="date" value={fields.issueDate} onChange={(v) => setFields((f) => ({ ...f, issueDate: v }))} />
        </div>
        <button
          type="submit"
          disabled={isLoading || Object.values(fields).some((v) => !v.trim())}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-blue-400 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
          Recompute &amp; Verify
        </button>
      </form>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {result && <VerificationResultCard hash={checkedHash} result={result} />}
    </div>
  );
}

function MiniField({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-500/60"
    />
  );
}

type ExtractResponse = {
  fields?: CertificateFields;
  assessment?: string;
  error?: string;
};

function AiUploadLookup() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<CertificateFields | null>(null);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [checkedHash, setCheckedHash] = useState("");

  async function handleFile(file: File) {
    setIsLoading(true);
    setError(null);
    setExtracted(null);
    setAssessment(null);
    setResult(null);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/extract-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      const data = (await res.json()) as ExtractResponse;

      if (!res.ok || !data.fields) {
        setError(data.error ?? "Couldn't read that document.");
        return;
      }

      setExtracted(data.fields);
      setAssessment(data.assessment ?? null);

      const hash = computeCertificateHash(data.fields);
      const onChain = await verifyCertificateHashClient(hash);
      setResult(onChain);
      setCheckedHash(hash);
    } catch {
      setError("Something went wrong reading or verifying that document.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Upload a photo or scan of the certificate. An AI model extracts the printed fields, we
        recompute the hash, and check it against the on-chain registry — same result as typing
        the fields manually, minus the typing.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-8 text-center transition-colors hover:border-blue-500/50 disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        ) : (
          <UploadCloud className="h-8 w-8 text-blue-400" />
        )}
        <span className="text-sm text-slate-300">
          {isLoading ? "Reading document..." : "Click to upload a certificate image"}
        </span>
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {extracted && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs">
          <p className="mb-2 font-semibold uppercase tracking-wide text-slate-500">
            AI-extracted fields
          </p>
          <dl className="grid grid-cols-2 gap-2 text-slate-300">
            <dt className="text-slate-500">Student</dt>
            <dd>{extracted.studentName}</dd>
            <dt className="text-slate-500">Student ID</dt>
            <dd>{extracted.studentId}</dd>
            <dt className="text-slate-500">Institution</dt>
            <dd>{extracted.institution}</dd>
            <dt className="text-slate-500">Credential</dt>
            <dd>{extracted.credentialType}</dd>
            <dt className="text-slate-500">Date</dt>
            <dd>{extracted.issueDate}</dd>
          </dl>
          {assessment && <p className="mt-3 text-slate-400">{assessment}</p>}
        </div>
      )}

      {result && <VerificationResultCard hash={checkedHash} result={result} />}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
