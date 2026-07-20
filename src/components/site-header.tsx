"use client";

import { Logo } from "@/components/logo";
import Link from "next/link";
import { useState } from "react";

export function SiteHeader() {
  const [cartCount] = useState(0);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-void/75 backdrop-blur border-b border-line">
      {/* Left: Logo */}
      <Link href="/" className="inline-flex items-center line-height-0">
        <Logo variant="wordmark" tone="white" height={19} />
      </Link>

      {/* Center: Links */}
      <div className="hidden md:flex gap-6.5 items-center">
        <Link
          href="/"
          className="font-mono text-xs tracking-wide uppercase text-muted hover:text-white transition-colors"
        >
          Início
        </Link>
        <Link
          href="/loja"
          className="font-mono text-xs tracking-wide uppercase text-muted hover:text-white transition-colors"
        >
          Loja
        </Link>
        <Link
          href="/personalizar"
          className="font-mono text-xs tracking-wide uppercase text-muted hover:text-white transition-colors"
        >
          Monte a sua
        </Link>
      </div>

      {/* Right: Cart */}
      <Link
        href="/carrinho"
        className="inline-flex items-center gap-2 px-3.5 py-2 border border-line-2 rounded-sm font-mono text-xs tracking-wider uppercase text-white hover:border-magenta hover:shadow-glow-m transition-all"
      >
        SACOLA <span className="text-cyan font-bold">{cartCount}</span>
      </Link>

      {/* Mobile burger (placeholder) */}
      <button className="md:hidden ml-4 text-2xl text-white" aria-label="Menu">
        ☰
      </button>
    </nav>
  );
}
