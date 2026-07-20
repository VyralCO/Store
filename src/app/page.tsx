import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/eyebrow";
import { HeroLogo } from "@/components/hero-logo";
import { Ticker } from "@/components/ticker";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

export default async function Home() {
  const products = await getProducts();
  const featured = products.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="hero-glow" />
        <div className="hero-glow c" />

        <Eyebrow tone="live">Sinal ao vivo — nova coleção no ar</Eyebrow>

        <HeroLogo />

        <p className="hero-sub">O HYPE VIRA ROUPA</p>

        <div className="hero-actions">
          <Link href="/loja">
            <Button variant="primary">
              Entrar na loja <span className="arw">→</span>
            </Button>
          </Link>
          <Link href="/personalizar">
            <Button variant="ghost">Monte a sua camiseta</Button>
          </Link>
        </div>

        <div className="hero-meta">
          <div>
            <b>79K</b>
            <span>na tribo</span>
          </div>
          <div>
            <b>240g</b>
            <span>tecido premium</span>
          </div>
          <div>
            <b>48H</b>
            <span>meme→roupa</span>
          </div>
        </div>
      </header>

      {/* TICKER */}
      <Ticker />

      {/* EM DESTAQUE */}
      <section className="section">
        <div className="container">
          <div className="sec-head">
            <div>
              <Eyebrow>Em destaque</Eyebrow>
              <h2 style={{ marginTop: "12px" }}>O que tá bombando</h2>
            </div>
            <p>
              Estampa costas full, tecido pesado, caimento largo. O print que
              quebrou a timeline, agora vestível.
            </p>
          </div>

          <div className="grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "34px" }}>
            <Link href="/loja">
              <Button variant="ghost">
                Ver coleção completa <span className="arw">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
