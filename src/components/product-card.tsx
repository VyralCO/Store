import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const price = (
    <>
      {product.oldPrice ? <s>{formatMoney(product.oldPrice)}</s> : null}
      {formatMoney(product.price)}
    </>
  );

  return (
    <Link href={`/produto/${product.slug}`} className="card">
      {product.badge ? (
        <span className={`badge ${product.badgeCyan ? "cy" : ""}`.trim()}>
          {product.badge}
        </span>
      ) : null}
      <div className="card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imagePath} alt={product.name} loading="lazy" />
      </div>
      <div className="card-info">
        <div className="cat">{product.category}</div>
        <h3>{product.name}</h3>
        <div className="card-row">
          <div className="card-price">{price}</div>
          <div className="card-cta">VER →</div>
        </div>
      </div>
    </Link>
  );
}
