"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/product";

type Filter = "all" | "preta" | "branca" | "meme";

const CHIPS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "preta", label: "Pretas" },
  { value: "branca", label: "Brancas" },
  { value: "meme", label: "Meme" },
];

export function ShopGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const list =
    filter === "all" ? products : products.filter((p) => p.color === filter);

  return (
    <>
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
          {list.length} {list.length === 1 ? "peça" : "peças"}
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
