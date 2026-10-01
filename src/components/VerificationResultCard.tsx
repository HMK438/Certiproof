import { CheckCircle2, Clock, ShieldX, XCircle } from "lucide-react";
import type { VerificationResult } from "@/lib/verify";

function formatDate(unixSeconds: number): string {
  if (!unixSeconds) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(unixSeconds * 1000));
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function VerificationResultCard({
  hash,
  result,
}: {
  hash: string;
  result: VerificationResult;
}) {
  if (!result.exists) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/50 p-8 text-center">
        <XCircle className="h-10 w-10 text-slate-500" />
        <p className="text-sm font-semibold text-slate-300">No matching certificate on-chain</p>
        <p className="max-w-sm text-xs text-slate-500">
          This hash has never been issued by CertificateRegistry. It may be forged, altered, or
          simply not yet issued.
        </p>
        <p className="mt-2 break-all rounded bg-slate-950 px-3 py-1.5 font-mono text-[11px] text-slate-500">
          {hash}
        </p>
      </div>
    );
  }

  if (result.revoked) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
        <ShieldX className="h-10 w-10 text-amber-400" />
        <p className="text-sm font-semibold text-amber-300">Certificate was revoked</p>
        <p className="max-w-sm text-xs text-amber-400/80">
          This certificate was issued but has since been revoked by the issuer.
        </p>
        <div className="mt-2 grid w-full grid-cols-1 gap-2 text-left text-xs sm:grid-cols-2">
          <InfoRow label="Issuer" value={shortenAddress(result.issuer)} />
          <InfoRow label="Issued" value={formatDate(result.issuedAt)} />
          <InfoRow label="Revoked" value={formatDate(result.revokedAt)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
      <CheckCircle2 className="h-10 w-10 text-emerald-400" />
      <p className="text-sm font-semibold text-emerald-300">Certificate is authentic</p>
      <p className="max-w-sm text-xs text-emerald-400/80">
        This hash was issued on-chain and has not been revoked.
      </p>
      <div className="mt-2 grid w-full grid-cols-1 gap-2 text-left text-xs sm:grid-cols-2">
        <InfoRow label="Issuer wallet" value={shortenAddress(result.issuer)} />
        <InfoRow
          label="Issued"
          value={formatDate(result.issuedAt)}
          icon={<Clock className="h-3 w-3" />}
        />
      </div>
      <p className="mt-2 w-full break-all rounded bg-slate-950 px-3 py-1.5 font-mono text-[11px] text-slate-500">
        {hash}
      </p>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 font-mono text-slate-300">{value}</p>
    </div>
  );
}
