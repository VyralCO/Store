import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import {
  getProductBySlug,
  getProducts,
  getVariantsBySlug,
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

  const [product, variants, all] = await Promise.all([
    getProductBySlug(slug),
    getVariantsBySlug(slug),
    getProducts(),
  ]);

  if (!product) notFound();

  const related = all.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="wrap">
      <div className="crumbs">
        <Link href="/">Início</Link> / <Link href="/loja">Loja</Link> /{" "}
        {product.name}
      </div>

      <div className="pdp">
        <div className="pdp-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.imagePath} alt={product.name} />
          <span className="zoom">ESTAMPA COSTAS</span>
        </div>

        <ProductDetail product={product} variants={variants} />
      </div>

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
