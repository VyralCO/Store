"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/components/cart/cart-provider";
import { createOrder } from "@/app/admin/actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  if (success) {
    return (
      <div className="wrap">
        <div className="empty">
          <h2>Pedido confirmado!</h2>
          <p style={{ fontSize: "1.2rem", color: "#00ff88", fontWeight: 700, margin: "12px 0" }}>
            {success}
          </p>
          <p>
            Você receberá um email com os detalhes. Acompanhe na sua conta.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <Link href="/conta" className="btn">
              Meus pedidos
            </Link>
            <Link href="/loja" className="btn ghost">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="wrap">
        <div className="empty">
          <h2>Sacola vazia</h2>
          <p>Adicione produtos antes de ir ao checkout.</p>
          <Link href="/loja" className="btn">
            Ver a loja →
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const cartItems = items.map((i) => ({
        slug: i.slug,
        name: i.name,
        size: i.size,
        price: i.price,
        qty: i.qty,
        imagePath: i.imagePath,
        custom: i.custom,
      }));

      const result = await createOrder(formData, cartItems);
      clear();
      setSuccess(result.orderNumber);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <div className="crumbs">
        <Link href="/carrinho">Sacola</Link> / Checkout
      </div>

      <div className="sec-head" style={{ marginTop: 6 }}>
        <h2>Checkout</h2>
      </div>

      {error && (
        <div
          style={{
            background: "#331111",
            border: "1px solid #441111",
            color: "#ff4444",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: "0.85rem",
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="checkout-grid">
          {/* Left: form */}
          <div className="checkout-form">
            <h3 className="checkout-section">Dados pessoais</h3>

            <div className="checkout-field">
              <label htmlFor="name">Nome completo</label>
              <input id="name" name="name" required placeholder="Seu nome" />
            </div>

            <div className="checkout-row">
              <div className="checkout-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="phone">Telefone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <h3 className="checkout-section">Endereço de entrega</h3>

            <div className="checkout-row">
              <div className="checkout-field" style={{ maxWidth: 180 }}>
                <label htmlFor="cep">CEP</label>
                <input id="cep" name="cep" required placeholder="00000-000" />
              </div>
              <div className="checkout-field" style={{ flex: 1 }}>
                <label htmlFor="rua">Rua</label>
                <input id="rua" name="rua" required placeholder="Rua / Avenida" />
              </div>
            </div>

            <div className="checkout-row">
              <div className="checkout-field" style={{ maxWidth: 120 }}>
                <label htmlFor="numero">Número</label>
                <input id="numero" name="numero" required placeholder="123" />
              </div>
              <div className="checkout-field" style={{ flex: 1 }}>
                <label htmlFor="complemento">Complemento</label>
                <input
                  id="complemento"
                  name="complemento"
                  placeholder="Apto, bloco..."
                />
              </div>
            </div>

            <div className="checkout-row">
              <div className="checkout-field">
                <label htmlFor="bairro">Bairro</label>
                <input id="bairro" name="bairro" required placeholder="Bairro" />
              </div>
              <div className="checkout-field">
                <label htmlFor="cidade">Cidade</label>
                <input id="cidade" name="cidade" required placeholder="Cidade" />
              </div>
              <div className="checkout-field" style={{ maxWidth: 100 }}>
                <label htmlFor="estado">Estado</label>
                <input id="estado" name="estado" required placeholder="SP" maxLength={2} />
              </div>
            </div>
          </div>

          {/* Right: summary */}
          <div className="checkout-summary">
            <h3 className="checkout-section">Resumo do pedido</h3>

            {items.map((i) => (
              <div key={i.key} className="checkout-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.imagePath} alt={i.name} />
                <div>
                  <div className="checkout-item-name">{i.name}</div>
                  <div className="checkout-item-meta">
                    Tam. {i.size} · Qtd. {i.qty}
                    {i.custom ? " · Custom" : ""}
                  </div>
                </div>
                <div className="checkout-item-price">
                  {formatMoney(i.price * i.qty)}
                </div>
              </div>
            ))}

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="checkout-total-row">
                <span>Frete</span>
                <span>{shipping === 0 ? "Grátis" : formatMoney(shipping)}</span>
              </div>
              <div className="checkout-total-row total">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{ width: "100%", marginTop: 16 }}
            >
              {loading ? "Processando..." : "Confirmar Pedido"}
            </button>

            <p style={{ fontSize: "0.7rem", color: "#555", textAlign: "center", marginTop: 8 }}>
              Pagamento via Mercado Pago será habilitado em breve.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
