import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout — VYRAL",
};

export default function CheckoutPage() {
  return (
    <div className="wrap">
      <div className="crumbs">
        <Link href="/carrinho">Sacola</Link> / Checkout
      </div>

      <div className="empty">
        <h2>Checkout em construção</h2>
        <p>
          O pagamento (Mercado Pago) entra numa próxima etapa. Por enquanto, a
          jornada vai até aqui.
        </p>
        <Link href="/carrinho" className="btn ghost">
          Voltar à sacola
        </Link>
      </div>
    </div>
  );
}
