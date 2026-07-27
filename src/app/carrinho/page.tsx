"use client";

import Link from "next/link";
import { formatMoney, BUSINESS } from "@/lib/format";
import { useCart } from "@/components/cart/cart-provider";

export default function CarrinhoPage() {
  const { items, subtotal, shipping, total, removeItem, changeQty } = useCart();

  if (items.length === 0) {
    return (
      <div className="wrap">
        <div className="empty">
          <h2>Sacola vazia</h2>
          <p>Nada aqui ainda. Bora resolver isso.</p>
          <Link href="/loja" className="btn">
            Ver a loja <span className="arw">→</span>
          </Link>
        </div>
      </div>
    );
  }

  const falta = BUSINESS.FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="wrap">
      <div className="crumbs">
        <Link href="/">Início</Link> / Sacola
      </div>

      <div className="sec-head" style={{ marginTop: "6px" }}>
        <h2>Sua sacola</h2>
      </div>

      <div className="cart-wrap">
        <div>
          {items.map((i) => (
            <div className="cart-line" key={i.key}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="thumb" src={i.imagePath} alt={i.name} />
              <div>
                <h4>{i.name}</h4>
                <div className="meta">
                  Tamanho {i.size}
                  {i.custom ? " · personalizada" : ""}
                </div>
                <button className="rm" onClick={() => removeItem(i.key)}>
                  remover
                </button>
              </div>
              <div>
                <div className="lp">{formatMoney(i.price * i.qty)}</div>
                <div className="qty">
                  <button
                    onClick={() => changeQty(i.key, -1)}
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span>{i.qty}</span>
                  <button
                    onClick={() => changeQty(i.key, 1)}
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="summary">
          <h3>Resumo</h3>
          <div className="row">
            Subtotal <b>{formatMoney(subtotal)}</b>
          </div>
          <div className="row">
            Frete <b>{shipping === 0 ? "Grátis" : formatMoney(shipping)}</b>
          </div>
          {shipping === 0 ? (
            <div className="free">✓ Frete grátis liberado</div>
          ) : (
            <div className="free">Faltam {formatMoney(falta)} pra frete grátis</div>
          )}
          <div className="row total">
            Total <b>{formatMoney(total)}</b>
          </div>
          <Link
            href="/checkout"
            className="btn block"
            style={{ marginTop: "16px" }}
          >
            Finalizar compra <span className="arw">→</span>
          </Link>
          <Link
            href="/loja"
            className="btn ghost block"
            style={{ marginTop: "10px" }}
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
