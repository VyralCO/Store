import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { ShopGrid } from "@/components/shop-grid";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "A Loja — VYRAL",
  description: "Cada frase, cada print, cada design que virou identidade.",
};

export default async function LojaPage() {
  const products = await getProducts();

  return (
    <div className="wrap">
      <div className="crumbs">
        <Link href="/">Início</Link> / Loja
      </div>

      <div className="sec-head" style={{ marginTop: "10px" }}>
        <div>
          <Eyebrow tone="live">Coleção</Eyebrow>
          <h2 style={{ marginTop: "12px" }}>A LOJA</h2>
        </div>
        <p>
          Cada frase, cada print, cada design que virou identidade. Escolhe o
          teu.
        </p>
      </div>

      <ShopGrid products={products} />
    </div>
  );
}
