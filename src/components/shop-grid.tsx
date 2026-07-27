"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/product";

type Filter = "all" | "preta" | "branca";

const CHIPS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "preta", label: "Pretas" },
  { value: "branca", label: "Brancas" },
];

export function ShopGrid({ products, initialSearch }: { products: Product[]; initialSearch?: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState(initialSearch ?? "");

  const searched = search.trim()
    ? products.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.keywords && p.keywords.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
        );
      })
    : products;

  const list =
    filter === "all"
      ? searched
      : searched.filter((p) =>
          filter === "preta" ? p.availableBlack : p.availableWhite,
        );

  return (
    <>
      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Pesquisar estampas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "#111118",
            border: "1px solid #1e1e2a",
            borderRadius: 10,
            color: "#fff",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
      </div>

      <div className="filters">
        {CHIPS.map((c) => (
          <button
            key={c.value}
            className={`chip${filter === c.value ? " active" : ""}`}
            onClick={() => setFilter(c.value)}
          >
            {c.label}
          </button>
        ))}
        <span className="count">
          {list.length} {list.length === 1 ? "estampa" : "estampas"}
        </span>
      </div>

      <div className="grid" style={{ marginTop: "20px" }}>
        {list.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {/* Card MONTE A SUA */}
        <Link href="/personalizar" className="card make">
          <div className="plus">+</div>
          <h3>Monte a sua</h3>
          <p>Sobe tua imagem e vira camiseta na hora.</p>
          <span className="btn cyan">Criar →</span>
        </Link>
      </div>
    </>
  );
}
