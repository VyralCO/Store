import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/eyebrow";
import { Customizer } from "@/components/customizer";

export const metadata: Metadata = {
  title: "Monte a sua — VYRAL",
};

export default function PersonalizarPage() {
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

      <Customizer />
    </div>
  );
}
