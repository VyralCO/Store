"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/components/cart/cart-provider";
import type { Product } from "@/types/product";
import type { VariantStock } from "@/lib/products";

export function ProductDetail({
  product,
  stockBlack,
  stockWhite,
}: {
  product: Product;
  stockBlack: VariantStock[];
  stockWhite: VariantStock[];
}) {
  const router = useRouter();
  const { addItem } = useCart();

  const colors: { value: string; label: string; emoji: string }[] = [];
  if (product.availableBlack) colors.push({ value: "preta", label: "Preta", emoji: "🖤" });
  if (product.availableWhite) colors.push({ value: "branca", label: "Branca", emoji: "🤍" });

  const [color, setColor] = useState<string>(colors[0]?.value ?? "preta");
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [warn, setWarn] = useState("");

  const variants = color === "preta" ? stockBlack : stockWhite;
  const imagePath =
    color === "preta"
      ? product.mockupBlackPath
      : product.mockupWhitePath;

  const off = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  function add(buyNow: boolean) {
    if (!size) {
      setWarn("Escolhe um tamanho primeiro.");
      return;
    }
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      size,
      color,
      qty,
      imagePath: imagePath || "",
    });
    if (buyNow) router.push("/carrinho");
  }

  return (
    <div className="pdp">
      <div className="pdp-media">
        {imagePath ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imagePath} alt={`${product.name} - ${color}`} />
        ) : (
          <div style={{ background: "#111", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", borderRadius: 12 }}>
            Sem mockup
          </div>
        )}
        <span className="zoom">ESTAMPA COSTAS</span>
      </div>

      <div className="pdp-info">
        <div className="cat">{product.categoryName ?? "Estampa"}</div>
        <h1>{product.name}</h1>

        <div className="pdp-price">
          {product.oldPrice ? <s>{formatMoney(product.oldPrice)}</s> : null}
          {formatMoney(product.price)}
          {product.oldPrice ? <span className="off">-{off}%</span> : null}
        </div>

        <p className="pdp-desc">{product.description}</p>

        {/* Color picker */}
        {colors.length > 1 && (
          <>
            <div className="field-label">Cor da Camiseta</div>
            <div className="size-pick">
              {colors.map((c) => (
                <button
                  key={c.value}
                  className={color === c.value ? "active" : ""}
                  onClick={() => { setColor(c.value); setSize(null); setWarn(""); }}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </>
        )}
        {colors.length === 1 && (
          <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: 8 }}>
            Camiseta {colors[0].emoji} {colors[0].label}
          </div>
        )}

        <div className="field-label">Tamanho</div>
        <div className="size-pick">
          {variants.map((v) => {
            const out = v.stock <= 0;
            return (
              <button
                key={v.size}
                className={size === v.size ? "active" : ""}
                disabled={out}
                aria-pressed={size === v.size}
                aria-label={out ? `Tamanho ${v.size} esgotado` : `Tamanho ${v.size}`}
                onClick={() => {
                  setSize(v.size);
                  setWarn("");
                }}
              >
                {v.size}
              </button>
            );
          })}
        </div>
        <div className="warn">
          {warn ? <span style={{ color: "var(--magenta)" }}>{warn}</span> : null}
        </div>

        <div className="field-label">Quantidade</div>
        <div className="qty">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir">
            −
          </button>
          <span aria-live="polite">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} aria-label="Aumentar">
            +
          </button>
        </div>

        <div className="pdp-actions">
          <button className="btn" onClick={() => add(false)}>
            Adicionar à sacola
          </button>
          <button className="btn ghost" onClick={() => add(true)}>
            Comprar agora
          </button>
        </div>

        <div className="pdp-meta">
          <div>
            <b>Tecido</b> Algodão premium 240g, oversized
          </div>
          <div>
            <b>Estampa</b> Costas full · alta definição
          </div>
          <div>
            <b>Entrega</b> 5 dias úteis · frete grátis acima de R$249
          </div>
          <div>
            <b>Troca</b> 30 dias · primeira troca por conta da casa
          </div>
        </div>
      </div>
    </div>
  );
}
