import Link from "next/link";
import { ExternalLink, Mail, ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-base font-semibold text-slate-100">{SITE.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-400">{SITE.tagline}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Platform
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/issue" className="text-sm text-slate-400 hover:text-blue-400">
                  Issue a Certificate
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-sm text-slate-400 hover:text-blue-400">
                  Verify a Certificate
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-slate-400 hover:text-blue-400">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Project
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href={SITE.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Source on GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {SITE.name}. Built by {SITE.author}.
          </p>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <p className="text-xs text-slate-500">{SITE.university}</p>
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400"
            >
              <Mail className="h-3.5 w-3.5" />
              {SITE.contactEmail}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
