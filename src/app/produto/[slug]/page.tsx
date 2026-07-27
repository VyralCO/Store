import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import {
  getProductBySlug,
  getProducts,
  getStockByColor,
} from "@/lib/products";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado — VYRAL" };
  return {
    title: `${product.name} — VYRAL`,
    description: product.description,
  };
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params;

  const [product, all] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ]);

  if (!product) notFound();

  // Get stock for available colors
  const stockBlack = product.availableBlack ? await getStockByColor("preta") : [];
  const stockWhite = product.availableWhite ? await getStockByColor("branca") : [];

  const related = all.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="wrap">
      <div className="crumbs">
        <Link href="/">Início</Link> / <Link href="/loja">Loja</Link> /{" "}
        {product.name}
      </div>

      <ProductDetail
        product={product}
        stockBlack={stockBlack}
        stockWhite={stockWhite}
      />

      {related.length > 0 && (
        <section className="section" style={{ paddingTop: "50px" }}>
          <div className="sec-head">
            <h2>Combina com</h2>
          </div>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
