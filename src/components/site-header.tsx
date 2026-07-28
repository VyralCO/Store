"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useCart } from "@/components/cart/cart-provider";

export function SiteHeader() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        {/* Marca */}
        <Link href="/" className="brand" aria-label="VYRAL — início">
          <Logo variant="wordmark" tone="white" height={19} />
        </Link>

        {/* Links desktop */}
        <div className="nav-links">
          <Link href="/">Início</Link>
          <Link href="/loja">Loja</Link>
          <Link href="/personalizar">Monte a sua</Link>
          <Link href="/conta">Conta</Link>
        </div>

        {/* Sacola */}
        <Link href="/carrinho" className="nav-cart">
          SACOLA <b>{count}</b>
        </Link>

        {/* Menu mobile */}
        <button
          className="nav-burger"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="nav-mobile-overlay" onClick={() => setMenuOpen(false)}>
          <div className="nav-mobile" onClick={(e) => e.stopPropagation()}>
            <Link href="/" onClick={() => setMenuOpen(false)}>Início</Link>
            <Link href="/loja" onClick={() => setMenuOpen(false)}>Loja</Link>
            <Link href="/personalizar" onClick={() => setMenuOpen(false)}>Monte a sua</Link>
            <Link href="/conta" onClick={() => setMenuOpen(false)}>Conta</Link>
            <Link href="/carrinho" onClick={() => setMenuOpen(false)}>Sacola ({count})</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
