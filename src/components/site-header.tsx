"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useCart } from "@/components/cart/cart-provider";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        {/* Marca */}
        <Link href="/" className="brand" aria-label="VYRAL — início">
          <Logo variant="wordmark" tone="white" height={19} />
        </Link>

        {/* Links */}
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
        <button className="nav-burger" aria-label="Menu">
          ☰
        </button>
      </div>
    </nav>
  );
}
