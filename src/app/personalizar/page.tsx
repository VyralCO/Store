import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { Customizer } from "@/components/customizer";
import { getCustomPricing } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Monte a sua — VYRAL",
};

export default async function PersonalizarPage() {
  const pricing = await getCustomPricing();

  return (
    <div className="wrap">
      <div className="crumbs">
        <Link href="/">Início</Link> / Monte a sua
      </div>

      <div className="sec-head" style={{ marginTop: "6px" }}>
        <div>
          <Eyebrow tone="live">Studio</Eyebrow>
          <h2 style={{ marginTop: "12px" }}>MONTE A SUA</h2>
        </div>
        <p>
          Sobe teu meme, tua arte, o que for. A gente joga na frente da camiseta
          na hora.
        </p>
      </div>

      <Customizer pricing={pricing} />
    </div>
  );
}
