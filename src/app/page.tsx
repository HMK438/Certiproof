import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileCheck2,
  GraduationCap,
  Hash,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { SITE, STATS } from "@/lib/site";

const PROBLEMS = [
  "Fake or altered academic certificates are difficult to catch during manual verification.",
  "Centralized verification databases are single points of failure with no public audit trail.",
  "Students have little control over how their credentials are shared and checked.",
  "Employers routinely wait days or weeks on institutions just to confirm one document.",
];

const STEPS = [
  {
    icon: Building2,
    title: "Institution issues",
    body: "An authorized issuer wallet computes a canonical hash of the credential's core fields and anchors it on-chain via CertificateRegistry.issueCertificate().",
  },
  {
    icon: QrCode,
    title: "Student receives",
    body: "The certificate is handed to the student with a QR code encoding its verification URL — no app or account needed to use it.",
  },
  {
    icon: ScanLine,
    title: "Verifier checks",
    body: "Anyone — an employer, another institution — scans the QR or enters the certificate ID and gets an instant on-chain result.",
  },
  {
    icon: Sparkles,
    title: "AI cross-checks",
    body: "Upload the physical document instead: an AI layer extracts its fields and flags any mismatch against the on-chain record.",
  },
];

const ROLES = [
  {
    icon: GraduationCap,
    title: "Institutions & Issuers",
    body: "Authorized university or organization wallets issue tamper-evident certificates in seconds, with a full on-chain audit trail of every issuance and revocation.",
  },
  {
    icon: Users,
    title: "Students & Holders",
    body: "Receive a QR-coded certificate you fully control — share it anywhere, and it stays verifiable without ever going back through the institution.",
  },
  {
    icon: FileCheck2,
    title: "Employers & Verifiers",
    body: "Confirm authenticity in seconds, for free, without emailing a registrar's office — by hash, QR code, or AI-assisted document upload.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(59,130,246,0.16), transparent 45%), radial-gradient(circle at 80% 10%, rgba(99,102,241,0.14), transparent 40%)",
          }}
        />
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-blue-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Web3 Academic Credential Platform
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-100 sm:text-5xl">
            Tamper-Evident Certificates,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Verified in Seconds
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            {SITE.description}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/issue"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(59,130,246,0.35)] transition-colors hover:bg-blue-400 sm:w-auto"
            >
              Issue a Certificate
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/verify"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-blue-500/50 hover:text-blue-400 sm:w-auto"
            >
              Verify a Certificate
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center"
            >
              <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              The Problem
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-100">
              Manual Verification Doesn&apos;t Scale
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PROBLEMS.map((problem) => (
              <div
                key={problem}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-sm leading-relaxed text-slate-400"
              >
                {problem}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              How It Works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              Four Steps, Zero Middlemen
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-slate-600">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-100">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Three Roles
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              Built for Everyone in the Loop
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ROLES.map((role) => (
              <div
                key={role.title}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                  <role.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-100">{role.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{role.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/50 p-8 sm:p-10">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Why On-Chain Hashes, Not Documents
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            CertiProof never stores certificate contents or personal data on-chain — only a
            keccak256 hash of the credential&apos;s canonical fields. This keeps gas costs low,
            keeps student data off a public and permanent ledger, and still lets anyone verify
            authenticity by re-deriving the same hash from a presented document and checking it
            against the registry.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            This project was developed as a Final Year Project at the {SITE.university},
            building a practical engineering solution for trusted academic credential verification
            and extending the original concept with an AI document-verification layer.
          </p>
        </div>
      </section>
    </>
  );
}
