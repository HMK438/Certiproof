"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import WalletConnectButton from "@/components/WalletConnectButton";
import { SITE } from "@/lib/site";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/issue", label: "Issue" },
  { href: "/verify", label: "Verify" },
  { href: "/#about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-100">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-blue-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <WalletConnectButton />
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="text-slate-300 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 pb-6 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-blue-400"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2">
              <WalletConnectButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
