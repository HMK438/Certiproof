import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VerificationResultCard from "@/components/VerificationResultCard";
import { isValidCertificateHash } from "@/lib/certificateHash";
import { isContractConfigured } from "@/lib/contract";
import { verifyCertificateHash } from "@/lib/verify";

export const dynamic = "force-dynamic";

export default async function VerifyHashPage({ params }: PageProps<"/verify/[hash]">) {
  const { hash } = await params;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <Link
        href="/verify"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to verification portal
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-slate-100">Certificate Verification</h1>

      <div className="mt-6">
        {!isContractConfigured() ? (
          <p className="text-sm text-amber-400">
            The contract isn&apos;t deployed yet — nothing to verify against.
          </p>
        ) : !isValidCertificateHash(hash) ? (
          <p className="text-sm text-rose-400">
            &quot;{hash}&quot; isn&apos;t a valid certificate hash.
          </p>
        ) : (
          <VerifyResult hash={hash} />
        )}
      </div>
    </div>
  );
}

async function VerifyResult({ hash }: { hash: `0x${string}` }) {
  const result = await verifyCertificateHash(hash);
  return <VerificationResultCard hash={hash} result={result} />;
}
